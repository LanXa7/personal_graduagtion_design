package com.example.listener

import com.example.ext.withTransaction
import com.example.model.entity.order.Order
import com.example.model.entity.order.copy
import com.example.model.enums.order.OrderEvents
import com.example.model.enums.order.OrderState
import com.example.repository.order.OrderRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.springframework.messaging.Message
import org.springframework.statemachine.annotation.OnTransition
import org.springframework.statemachine.annotation.WithStateMachine
import org.springframework.stereotype.Component

@Component
@WithStateMachine(name = "orderStateMachine")
class OrderStateListener(
    private val orderRepository: OrderRepository
) {

    @OnTransition(source = ["PENDING"], target = ["PAYED"])
    fun pay(message: Message<OrderEvents>): Boolean {
        val orderId = updateOrderState(message, OrderState.PAYED)
        log.info { "Order: $orderId payed" }
        return true
    }

    @OnTransition(source = ["PENDING"], target = ["CANCELED"])
    fun shipping(message: Message<OrderEvents>): Boolean {
        val orderId = updateOrderState(message, OrderState.CANCELED)
        log.info { "Order: $orderId shipped" }
        return true
    }

    @OnTransition(source = ["PENDING"], target = ["TIMED_OUT"])
    fun receive(message: Message<OrderEvents>): Boolean {
        updateOrderState(message, OrderState.TIMED_OUT)
        return true
    }

    private fun updateOrderState(
        message: Message<OrderEvents>,
        state: OrderState
    ): Long {
        val order = message.headers["order"] as Order
        withTransaction {
            orderRepository.save(
                order.copy {
                    this.state = state
                }
            ) {
                setMode(SaveMode.UPDATE_ONLY)
            }
        }
        return order.id
    }


    companion object {
        
        private val log = KotlinLogging.logger {}
    }
}