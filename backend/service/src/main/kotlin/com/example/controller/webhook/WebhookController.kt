package com.example.controller.webhook

import com.example.service.order.OrderService
import io.github.oshai.kotlinlogging.KotlinLogging
import jakarta.servlet.http.HttpServletRequest
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/webhook")
class WebhookController(
    private val orderService: OrderService
) {

    @PostMapping("/alipay/notify")
    fun handleNotify(
        req: HttpServletRequest
    ) {
        log.info { "接收到支付宝请求回调" }
        orderService.handleApiPay(req)
    }

    companion object {
        
        private val log = KotlinLogging.logger {}
    }
}