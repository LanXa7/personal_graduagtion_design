package com.example.controller.order

import com.example.model.entity.order.Order
import com.example.model.entity.order.dto.OrderPayView
import com.example.model.enums.order.OrderState
import com.example.service.file.ImageService
import com.example.service.order.OrderService
import org.babyfish.jimmer.Page
import org.babyfish.jimmer.client.FetchBy
import org.babyfish.jimmer.client.meta.DefaultFetcherOwner
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate

@RestController
@DefaultFetcherOwner(value = OrderService::class)
@RequestMapping("/order")
class OrderController(
    private val imageService: ImageService,
    private val orderService: OrderService
) {

    @GetMapping("/page")
    fun pageOrder(
        @RequestParam(defaultValue = "0") pageIndex: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam canteenId: Long?,
        @RequestParam stallId: Long?,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") startDay: LocalDate?,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") endDay: LocalDate?,
        @RequestParam orderState: OrderState?
    ): Page<@FetchBy("ORDER_FETCHER") Order> =
        orderService.pageOrder(
            pageIndex,
            pageSize,
            canteenId,
            stallId,
            startDay,
            endDay,
            orderState
        )

    @GetMapping("/{id}/order_item")
    fun getOrderItem(
        @PathVariable id: Long
    ) =
        orderService.getOrderItem(id)

    /**
     * 拍照上传到minio 再调用算法识别 构建订单 生成支付二维码返回
     */
    @PostMapping("/upload")
    fun uploadOrder(@RequestPart("file") file: MultipartFile): OrderPayView {
        val (orderId, url) = imageService.uploadOrder(file)
        return orderService.getOrderInfo(orderId, url)
    }

    /**
     * 查询订单状态
     */
    @GetMapping("/status/{code}")
    fun getOrderStatus(@PathVariable code: String): String =
        orderService.getOrderStatus(code)

}