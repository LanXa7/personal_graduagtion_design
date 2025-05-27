package com.example.service.file

import com.example.exception.RequestErrorBodyException
import com.example.ext.withTransaction
import com.example.model.entity.order.Order
import com.example.model.entity.user.User
import com.example.model.enums.Role
import com.example.model.enums.order.OrderState
import com.example.processor.OrderProcessor
import com.example.repository.canteen.FoodRepository
import com.example.repository.order.OrderRepository
import com.example.repository.user.UserRepository
import com.example.utils.FileUtils
import com.example.utils.MinioUtils
import com.example.utils.MyStpUtils
import io.github.oshai.kotlinlogging.KotlinLogging
import io.minio.errors.MinioException
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.math.BigDecimal
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.*

@Service
class ImageService(
    private val minioUtils: MinioUtils,
    private val userRepository: UserRepository,
    private val fileUtils: FileUtils,
    private val orderRepository: OrderRepository,
    private val processor: OrderProcessor,
    private val foodRepository: FoodRepository
) {

    /**
     * 上传头像
     */
    fun uploadAvatar(file: MultipartFile, userId: Long): String {
        fileUtils.checkAvatarSize(file.size)
        val imageName = AVATAR_PREFIX + "${MyStpUtils.getCurrentUserId()}/" + minioUtils.initImageName()
        val args = minioUtils.getArgs(file, imageName)
        try {
            minioUtils.putObject(args)
            val avatar = userRepository.findById(userId)?.avatar
            minioUtils.removeObject(avatar)
            withTransaction {
                userRepository.save(
                    User {
                        this.id = userId
                        this.avatar = imageName
                    }
                ) {
                    setMode(SaveMode.UPDATE_ONLY)
                }
            }
            return imageName
        } catch (exception: MinioException) {
            log.error { "头像上传出现问题: ${exception.message}" }
            throw exception
        }
    }

    /**
     * 构造订单号
     */
    private fun getOrderCode(): String {
        val currentDate = LocalDate.now().format(formatter)
        val uuid = UUID.randomUUID().toString().replace("-", "").take(8)
        return "$currentDate$uuid"
    }

    /**
     * 上传订单图片
     */
    fun uploadOrder(file: MultipartFile): Pair<Long, String> {
        fileUtils.checkFileSize(file.size)
        val orderCode = getOrderCode()
        val imageName = ORDER_PREFIX + "${MyStpUtils.getCurrentStallId()}/" + minioUtils.initImageName()
        val args = minioUtils.getArgs(file, imageName)
        try {
            minioUtils.putObject(args)
            val orderId = withTransaction {
                orderRepository.save(
                    Order {
                        this.code = orderCode
                        this.picture = imageName
                        this.totalPrice = BigDecimal.ZERO
                        this.state = OrderState.PENDING
                        this.stallId = MyStpUtils.getCurrentStallId()
                    }
                ) {
                    setMode(SaveMode.INSERT_ONLY)
                }.modifiedEntity.id
            }
            return Pair(orderId, imageName)
        } catch (exception: MinioException) {
            log.error { "订单图片上传出现问题: ${exception.message}" }
            minioUtils.removeObject(imageName)
            throw exception
        }
    }

    fun uploadPicture(file: MultipartFile, stallId: Long?, id: Long?): String {
        fileUtils.checkFoodPictureSize(file.size)
        val role = MyStpUtils.getCurrentUserRole()
        val imageName = if (role == Role.STALL_ADMIN) {
            FOOD_PREFIX + "${MyStpUtils.getCurrentStallId()}/" + minioUtils.initImageName()
        } else {
            if (stallId == null) {
                throw RequestErrorBodyException()
            }
            FOOD_PREFIX + "$stallId/" + minioUtils.initImageName()
        }
        val args = minioUtils.getArgs(file, imageName)
        try {
            minioUtils.putObject(args)
            id?.let {
                foodRepository.findById(it)?.picture
            }?.let {
                minioUtils.removeObject(it)
            }
            return imageName
        } catch (exception: MinioException) {
            log.error { "食物图片上传出现问题: ${exception.message}" }
            throw exception
        }
    }

    companion object {
        
        private val log = KotlinLogging.logger {}
        private const val AVATAR_PREFIX = "/avatar/user/"
        private const val ORDER_PREFIX = "/order/stall/"
        private const val FOOD_PREFIX = "/food/stall/"
        private val formatter = DateTimeFormatter.ofPattern("yyyyMMdd")
    }
}