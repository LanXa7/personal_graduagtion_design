package com.example.config

import com.example.websocket.PaymentStatusHandler
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.server.ServerHttpRequest
import org.springframework.http.server.ServerHttpResponse
import org.springframework.web.socket.WebSocketHandler
import org.springframework.web.socket.config.annotation.EnableWebSocket
import org.springframework.web.socket.config.annotation.WebSocketConfigurer
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry
import org.springframework.web.socket.server.HandshakeInterceptor


@Configuration
@EnableWebSocket
class WebSocketConfig(
    private val paymentStatusHandler: PaymentStatusHandler,
) : WebSocketConfigurer {

    override fun registerWebSocketHandlers(registry: WebSocketHandlerRegistry) {
        registry.addHandler(paymentStatusHandler, "/ws/payment/status/{orderCode}")
            .setAllowedOrigins("*")
            .addInterceptors(orderCodeInterceptor())
    }

    @Bean
    fun orderCodeInterceptor(): HandshakeInterceptor {
        return object : HandshakeInterceptor {
            override fun beforeHandshake(
                request: ServerHttpRequest,
                response: ServerHttpResponse,
                wsHandler: WebSocketHandler,
                attributes: MutableMap<String, Any>
            ): Boolean {
                log.info { "握手拦截!" }
                val path = request.uri.path
                val orderCode = path.substringAfterLast("/")
                if (orderCode.isBlank() || !orderCode.matches(Regex("^[a-zA-Z0-9]{10,20}$"))) {
                    return false
                }
                attributes["orderCode"] = orderCode
                return true
            }

            override fun afterHandshake(
                request: ServerHttpRequest,
                response: ServerHttpResponse,
                wsHandler: WebSocketHandler,
                exception: Exception?
            ) {
                // 握手成功后处理
                log.info { "握手成功！" }
            }
        }
    }

    companion object {
        
        private val log = KotlinLogging.logger {}
    }
}