package com.example.service.order

import com.alipay.api.domain.AlipayTradePagePayModel
import com.alipay.api.domain.AlipayTradePrecreateModel
import com.alipay.api.domain.AlipayTradeQueryModel
import com.alipay.api.internal.util.AlipaySignature
import com.example.config.properties.AliPayProperties
import com.example.exception.FlaskRequestException
import com.example.exception.FlaskRequestIdentifyException
import com.example.exception.OrderIsNotFoundException
import com.example.ext.times
import com.example.ext.toMapFromArray
import com.example.ext.withTransaction
import com.example.model.entity.canteen.Food
import com.example.model.entity.canteen.Sales
import com.example.model.entity.canteen.by
import com.example.model.entity.canteen.copy
import com.example.model.entity.order.Order
import com.example.model.entity.order.OrderItem
import com.example.model.entity.order.by
import com.example.model.entity.order.dto.OrderPayView
import com.example.model.enums.Role.*
import com.example.model.enums.order.OrderEvents
import com.example.model.enums.order.OrderState
import com.example.processor.OrderProcessor
import com.example.repository.canteen.CanteenRepository
import com.example.repository.canteen.FoodRepository
import com.example.repository.canteen.SalesRepository
import com.example.repository.canteen.StallRepository
import com.example.repository.order.OrderRepository
import com.example.utils.HttpUtil
import com.example.utils.MinioUtils
import com.example.utils.MyStpUtils
import com.example.utils.RedissonUtils
import com.example.websocket.PaymentStatusHandler
import com.ijpay.alipay.AliPayApi
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.http.HttpServletRequest
import org.babyfish.jimmer.Page
import org.babyfish.jimmer.kt.isLoaded
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter


@Service
class OrderService(
    private val orderRepository: OrderRepository,
    private val foodRepository: FoodRepository,
    private val canteenRepository: CanteenRepository,
    private val stallRepository: StallRepository,
    private val minioUtils: MinioUtils,
    private val paymentStatusHandler: PaymentStatusHandler,
    private val redissonUtils: RedissonUtils,
    private val aliPayProperties: AliPayProperties,
    private val orderProcessor: OrderProcessor,
    private val salesRepository: SalesRepository,
    @param:Value("\${alipay.domain}")
    private val notifyUrl: String
) {

    fun pageOrder(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallId: Long?,
        startDay: LocalDate?,
        endDay: LocalDate?,
        orderState: OrderState?
    ): Page<Order> {
        val role = MyStpUtils.getCurrentUserRole()
        val startTime = startDay?.atStartOfDay()
        val endTime = endDay?.plusDays(1)?.atStartOfDay()
        return when (role) {
            SUPER_ADMIN -> pageOrderByDifferentRole(pageIndex, pageSize, canteenId, stallId, startTime, endTime, orderState)

            CANTEEN_ADMIN -> {
                val canteenId = canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId())
                pageOrderByDifferentRole(pageIndex, pageSize, canteenId, stallId, startTime, endTime, orderState)
            }

            STALL_ADMIN -> {
                val stallId = stallRepository.findIdByUserId(MyStpUtils.getCurrentUserId())
                pageOrderByDifferentRole(pageIndex, pageSize, canteenId, stallId, startTime, endTime, orderState)
            }

            NORMAL -> TODO()
        }
    }

    fun pageOrderByDifferentRole(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallId: Long?,
        startTime: LocalDateTime?,
        endTime: LocalDateTime?,
        orderState: OrderState?
    ) =
        orderRepository.pageOrderOrderByCreateTimeDesc(
            pageIndex,
            pageSize,
            canteenId,
            stallId,
            startTime,
            endTime,
            orderState,
            ORDER_FETCHER
        )

    fun getOrderInfo(orderId: Long, url: String): OrderPayView {
        try {
            val queryParams = mapOf("url" to url)
            val resp = HttpUtil.getAsString(FLASK_ADDRESS, queries = queryParams)
            val nameToNumberMap = resp?.toMapFromArray<String, Int>(
                "results",
                "name",
                "count"
            ) ?: throw FlaskRequestException()
            if (nameToNumberMap.isEmpty()) {
                throw FlaskRequestIdentifyException()
            }
            val orderItems: MutableList<OrderItem> = mutableListOf()
            nameToNumberMap.forEach { (name, number) ->
                val food = foodRepository.findByNameAndStallId(name, MyStpUtils.getCurrentStallId(), FOOD_PRICE_FETCHER)
                val orderItem = OrderItem {
                    this.orderId = orderId
                    this.foodId = food.id
                    this.totalPrice = food.price.times(number)
                    this.totalNumber = number
                }
                orderItems.add(orderItem)
            }
            val orderTotalPrice = orderItems.sumOf { it.totalPrice }
            val order = withTransaction {
                orderRepository.saveCommand(
                    Order {
                        id = orderId
                        totalPrice = orderTotalPrice
                        this.orderItems = orderItems
                    }
                ) {
                    setMode(SaveMode.UPDATE_ONLY)
                }.execute(
                    ORDER_ITEM_FETCHER,
                ).modifiedEntity
            }
            val qrCode = getAlipayQrCode(order)
            return OrderPayView(order, qrCode)
        } catch (ex: Exception) {
            log.error(ex) { "${ex.message}" }
            minioUtils.removeObject(url)
            throw FlaskRequestException()
        }
    }

    private fun getAlipayPcForm(order: Order): String {
        val model = AlipayTradePagePayModel()
        val zone = ZoneId.of("Asia/Shanghai")
        model.apply {
            this.subject = "${System.currentTimeMillis()}"
            this.outTradeNo = order.code
            this.productCode = "FAST_INSTANT_TRADE_PAY"
            this.qrPayMode = "4"
            this.qrcodeWidth = 200
            this.totalAmount = order.totalPrice.toString()
            // 最迟支付时间为当前时间 +3 min
            this.timeExpire = "${LocalDateTime.now(zone).plusMinutes(3).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))}"
        }
        return AliPayApi.tradePage(model, "", notifyUrl)
    }

    private fun getAlipayQrCode(order: Order): String {
        val model = AlipayTradePrecreateModel()
        val zone = ZoneId.of("Asia/Shanghai")
        model.apply {
            this.subject = "${System.currentTimeMillis()}"
            this.outTradeNo = order.code
            this.totalAmount = order.totalPrice.toString()
            this.timeExpire = "${LocalDateTime.now(zone).plusMinutes(3).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))}"
        }
        val resp = AliPayApi.tradePrecreatePayToResponse(model, notifyUrl)
        redissonUtils.ws.setOrderCode(order.code)
        return resp.qrCode
    }

    fun getOrderItem(id: Long) =
        orderRepository.findById(id, ORDER_ITEM_FETCHER) ?: throw OrderIsNotFoundException()

    fun getOrderStatus(code: String): String {
        val model = AlipayTradeQueryModel()
        model.apply {
            this.outTradeNo = code
        }
        val resp = AliPayApi.tradeQueryToResponse(model)
        val code = resp.code
        if (code == "40004") {
            log.info { "order_$code 尚未扫码" }
            return "THE_CODE_WAS_NOT_SCANNED"
        }
        val status = resp.tradeStatus
        log.info { "order_$code status: $status" }
        return status
    }

    fun handleApiPay(req: HttpServletRequest) {
        val map = AliPayApi.toMap(req)
        val verifyResult = AlipaySignature.rsaCertCheckV1(
            map, aliPayProperties.alipayCertPath, "UTF-8",
            "RSA2"
        )
        if (verifyResult) {
            log.info { "支付宝回调验签成功!" }
            if (map["trade_status"] == "TRADE_SUCCESS") {
                map["out_trade_no"]?.let {
                    val order = orderRepository.findByCode(it, ORDER_ITEM_FETCHER)
                    orderProcessor.process(order, OrderEvents.PAY)
                    paymentStatusHandler.notifyPaymentSuccess(it)
                    saveSales(order.orderItems)
                }
            }
        }
    }

    private fun saveSales(orderItems: List<OrderItem>) {
        val entities: MutableList<Sales> = mutableListOf()
        orderItems.forEach {
            val foodId = it.food.id
            val stallId = it.food.stall.id
            val entity = salesRepository.findTodayInfoByStallIdAndFoodId(
                stallId,
                foodId,
                todayStart = LocalDate.now().atStartOfDay(),
                tomorrowStart = LocalDate.now().plusDays(1).atStartOfDay(),
                STALES_VOLUME_FETCHER
            )
            entities.add(getSales(entity, foodId, stallId, it.totalNumber))
        }
        withTransaction {
            salesRepository.saveEntities(
                entities.filter {
                    isLoaded(it, Sales::id)
                }, SaveMode.UPDATE_ONLY
            )
            salesRepository.saveEntities(
                entities.filterNot {
                    isLoaded(it, Sales::id)
                }, SaveMode.INSERT_ONLY
            )
        }
    }

    private fun getSales(
        entity: Sales?,
        foodId: Long,
        stallId: Long,
        totalNumber: Int
    ) =
        entity?.copy {
            this.number = this.number + totalNumber
        } ?: Sales {
            this.foodId = foodId
            this.stallId = stallId
            this.number = totalNumber
        }

    companion object {

        private val log = KotlinLogging.logger {}
        private const val FLASK_ADDRESS = "http://14.103.249.113:15000/process_frame"
        private val FOOD_PRICE_FETCHER = newFetcher(Food::class).by {
            price()
        }
        private val ORDER_FETCHER = newFetcher(Order::class).by {
            allScalarFields()
            stall {
                name()
                canteen {
                    name()
                }
            }
        }
        private val ORDER_ITEM_FETCHER = newFetcher(Order::class).by {
            code()
            totalPrice()
            picture()
            state()
            createTime()
            orderItems {
                totalPrice()
                totalNumber()
                food {
                    name()
                    stall()
                }
            }
        }
        private val STALES_VOLUME_FETCHER = newFetcher(Sales::class).by {
            number()
        }
    }
}