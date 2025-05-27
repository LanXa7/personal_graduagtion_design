package com.example.websocket

import com.example.utils.RedissonUtils
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.stereotype.Component
import org.springframework.web.socket.CloseStatus
import org.springframework.web.socket.TextMessage
import org.springframework.web.socket.WebSocketSession
import org.springframework.web.socket.handler.TextWebSocketHandler
import java.util.concurrent.ConcurrentHashMap

@Component
class PaymentStatusHandler(
    private val redissonUtils: RedissonUtils
) : TextWebSocketHandler() {

    companion object {
        private const val PAYMENT_SUCCESS_MSG = "PAYMENT_SUCCESS"
        private const val PAYMENT_FAILED_MSG = "PAYMENT_FAILED"

        
        private val log = KotlinLogging.logger {}

    }

    private val sessions = ConcurrentHashMap<String, WebSocketSession>()

    override fun afterConnectionEstablished(session: WebSocketSession) {
        val orderCode = session.attributes["orderCode"] as? String ?: run {
            session.close(CloseStatus.NOT_ACCEPTABLE)
            return
        }

        try {
            if (!redissonUtils.ws.isOrderCodeExist(orderCode)) {
                session.close(CloseStatus.NOT_ACCEPTABLE)
                return
            }

            sessions[orderCode]?.let { existingSession ->
                if (existingSession.isOpen) {
                    session.close(CloseStatus.SESSION_NOT_RELIABLE)
                    return
                } else {
                    sessions.remove(orderCode)
                }
            }

            sessions[orderCode] = session
            log.info { "WebSocket connected for order: $orderCode" }
        } catch (ex: Exception) {
            log.error(ex) { "Error during connection establishment" }
            session.close(CloseStatus.SERVER_ERROR)
        }
    }

    override fun handleTextMessage(session: WebSocketSession, message: TextMessage) {
        try {
            if (message.payload == "PING") {
                session.sendMessage(TextMessage("PONG"))
            }
        } catch (ex: Exception) {
            log.error(ex) { "Error processing message" }
        }
    }

    override fun afterConnectionClosed(session: WebSocketSession, status: CloseStatus) {
        sessions.values.remove(session)
        log.info { "Connection closed: ${status.code} - ${status.reason}" }
    }

    override fun handleTransportError(session: WebSocketSession, exception: Throwable) {
        log.error(exception) { "Transport error" }
        try {
            session.close(CloseStatus.SERVER_ERROR)
        } catch (ex: Exception) {
            log.error(ex) { "Error closing session" }
        }
    }

    fun notifyPaymentSuccess(orderCode: String) {
        notifyPaymentStatus(orderCode, PAYMENT_SUCCESS_MSG)
    }

    fun notifyPaymentFailed(orderCode: String) {
        notifyPaymentStatus(orderCode, PAYMENT_FAILED_MSG)
    }

    private fun notifyPaymentStatus(orderCode: String, message: String) {
        val session = sessions[orderCode] ?: run {
            log.warn { "No active session for order: $orderCode" }
            return
        }

        if (!session.isOpen) {
            sessions.remove(orderCode)
            log.warn { "Session was closed for order: $orderCode" }
            return
        }

        try {
            session.sendMessage(TextMessage(message))
            log.info { "Sent $message for order: $orderCode" }

            // Clean up
            sessions.remove(orderCode)
            redissonUtils.ws.deleteOrderCode(orderCode)

            // Close the connection after notification
            session.close(CloseStatus.NORMAL)
        } catch (ex: Exception) {
            log.error(ex) { "Error notifying payment status" }
            sessions.remove(orderCode)
            try {
                session.close()
            } catch (ex: Exception) {
                log.error(ex) { "Error closing session" }
            }
        }
    }

}