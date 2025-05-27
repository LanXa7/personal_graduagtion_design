package com.example.service.canteen

import com.example.exception.FlaskRequestException
import com.example.exception.RequestErrorBodyException
import com.example.ext.getList
import com.example.ext.toJsonNode
import com.example.ext.withTransaction
import com.example.model.entity.canteen.Food
import com.example.model.entity.canteen.by
import com.example.model.entity.canteen.dto.FoodSaveInput
import com.example.model.enums.Role
import com.example.model.enums.Role.*
import com.example.repository.canteen.CanteenRepository
import com.example.repository.canteen.FoodRepository
import com.example.repository.canteen.SalesRepository
import com.example.repository.canteen.StallRepository
import com.example.utils.HttpUtil
import com.example.utils.MyStpUtils
import io.github.oshai.kotlinlogging.KotlinLogging
import org.babyfish.jimmer.Page
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.time.LocalDate

@Service
class FoodService(
    private val foodRepository: FoodRepository,
    private val canteenRepository: CanteenRepository,
    private val stallRepository: StallRepository,
    private val SalesRepository: SalesRepository,
) {

    fun pageFood(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallId: Long?,
        foodName: String?
    ): Page<Food> {
        val role = MyStpUtils.getCurrentUserRole()
        return when (role) {
            SUPER_ADMIN -> pageFoodByDifferentRole(pageIndex, pageSize, canteenId, stallId, foodName)

            CANTEEN_ADMIN -> {
                val canteenId = canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId())
                pageFoodByDifferentRole(pageIndex, pageSize, canteenId, stallId, foodName)
            }

            STALL_ADMIN -> {
                val stallId = stallRepository.findIdByUserId(MyStpUtils.getCurrentUserId())
                pageFoodByDifferentRole(pageIndex, pageSize, canteenId, stallId, foodName)
            }

            NORMAL -> TODO()
        }
    }

    private fun pageFoodByDifferentRole(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallId: Long?,
        foodName: String?
    ) =
        foodRepository.pageFoodOrderByCreateTimeDesc(pageIndex, pageSize, canteenId, stallId, foodName, FOOD_FETCHER)


    fun createFood(input: FoodSaveInput) {
        val role = MyStpUtils.getCurrentUserRole()
        val stallId = getStallIdByRole(role, input.stallId)
        saveFood(
            input.toEntity {
                this.stallId = stallId
            }, SaveMode.INSERT_ONLY
        )
    }

    fun updateFood(id: Long, input: FoodSaveInput) {
        val role = MyStpUtils.getCurrentUserRole()
        val stallId = getStallIdByRole(role, input.stallId)
        saveFood(
            input.toEntity {
                this.id = id
                this.stallId = stallId
            }, SaveMode.UPDATE_ONLY
        )
    }

    private fun getStallIdByRole(role: Role, inputStallId: Long?): Long {
        return when (role) {
            SUPER_ADMIN, CANTEEN_ADMIN -> {
                if (inputStallId == null) {
                    throw RequestErrorBodyException()
                }
                inputStallId
            }

            STALL_ADMIN -> MyStpUtils.getCurrentStallId()
            else -> TODO()
        }
    }


    private fun saveFood(entity: Food, saveMode: SaveMode) {
        withTransaction {
            foodRepository.save(
                entity
            ) {
                setMode(saveMode)
            }
        }
    }


    fun deleteFood(id: Long) {
        withTransaction {
            foodRepository.deleteById(id)
        }
    }

    fun listFood(): List<Food> {
        val role = MyStpUtils.getCurrentUserRole()
        return when (role) {
            SUPER_ADMIN ->
                listFoodByDifferentRole()

            CANTEEN_ADMIN -> {
                val canteenId = canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId())
                listFoodByDifferentRole(canteenId = canteenId)
            }

            STALL_ADMIN -> {
                val stallId = stallRepository.findIdByUserId(MyStpUtils.getCurrentUserId())
                listFoodByDifferentRole(stallId = stallId)
            }

            NORMAL -> TODO()
        }
    }

    private fun listFoodByDifferentRole(
        canteenId: Long? = null,
        stallId: Long? = null
    ) =
        foodRepository.listFood(canteenId, stallId, FOOD_LIST_FETCHER)

    private fun getRecommendationName(): List<String> {
        val temp = SalesRepository.findYesterdayFoodMapByStallId(
            MyStpUtils.getCurrentStallId(),
            todayStart = LocalDate.now().atStartOfDay(),
            yesterdayStart = LocalDate.now().minusDays(1).atStartOfDay()
        )
        val body = mapOf("yesterdaySales" to temp)
        log.info { "body: $body" }
        val resp = HttpUtil.post(FLASK_ADDRESS, bodyParam = body) ?: throw FlaskRequestException()
        val recommendations = resp.toJsonNode()["recommendations"].getList<String>()
        log.info { "recommendations: $recommendations" }
        return recommendations
    }

    private fun incorporationRecommendationName(
        result: List<String>,
        food: List<Food>
    ): List<String> {
        // 1.筛选出存在于food中的推荐项（最多取前x个）
        val matched = result.filter { rec -> food.any { it.name == rec } }.take(MAX_NUMBER)
        val remainingCount = MAX_NUMBER - matched.size
        // 如果x个刚好直接返回
        if (remainingCount == 0) {
            return matched
        }
        // 2.若不足5个，从food中随机补充不重复的项
        val randomSupplement = food.map { it.name }
            .filterNot { it in matched }  // 排除已匹配的
            .shuffled()
            .take(remainingCount)
        // 3.合并结果
        return matched + randomSupplement
    }

    fun getRecommendation(): Map<String, List<Food>> {
        val result = getRecommendationName()
        val food = foodRepository.findByStallId(
            MyStpUtils.getCurrentStallId(),
            FOOD_LIST_FETCHER
        )
        val recommendationNames = incorporationRecommendationName(result, food)
        return food.groupBy { it.name in recommendationNames }.mapKeys {
            if (it.key) "recommendation" else "leftoverFood"
        }
    }

    fun updateFoodPrice(id: Long, price: BigDecimal) {
        withTransaction {
            foodRepository.save(
                Food {
                    this.id = id
                    this.price = price
                }, SaveMode.UPDATE_ONLY
            )
        }
    }

    fun getFoodNumber() =
        when (MyStpUtils.getCurrentUserRole()) {
            SUPER_ADMIN -> foodRepository.findFoodNumber()
            CANTEEN_ADMIN -> foodRepository.findFoodNumber(canteenId = canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId()))
            STALL_ADMIN -> foodRepository.findFoodNumber(stallId = MyStpUtils.getCurrentStallId())
            NORMAL -> TODO()
        }

    companion object {
        private val log = KotlinLogging.logger {}

        private const val MAX_NUMBER = 5
        private val FOOD_FETCHER = newFetcher(Food::class).by {
            name()
            picture()
            code()
            description()
            createTime()
            price()
            stall {
                name()
                canteen {
                    name()
                }
            }
        }
        private val FOOD_LIST_FETCHER = newFetcher(Food::class).by {
            name()
            picture()
            price()
        }

        private const val FLASK_ADDRESS = "http://14.103.249.113:15000/process_frame"
    }
}