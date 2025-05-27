package com.example.processor

import com.example.model.entity.order.Order
import com.example.model.enums.order.OrderEvents
import com.example.model.enums.order.OrderState
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.messaging.Message
import org.springframework.messaging.support.MessageBuilder
import org.springframework.statemachine.StateMachine
import org.springframework.statemachine.StateMachineEventResult.ResultType
import org.springframework.statemachine.persist.StateMachinePersister
import org.springframework.stereotype.Component
import reactor.core.publisher.Mono

@Component
class OrderProcessor(
    private val orderStateMachine: StateMachine<OrderState, OrderEvents>,
    private val persister: StateMachinePersister<OrderState, OrderEvents, Order>
) {


    fun process(order: Order, event: OrderEvents): Boolean {
        // 构建Message对象，包含事件和扩展状态
        val message = MessageBuilder
            .withPayload(event)
            .setHeader("order", order) // 将订单对象放入消息头部
            .build()
        log.info { "发送订单消息" }
        return sendEvent(message)
    }


    private fun sendEvent(message: Message<OrderEvents>): Boolean {
        val order = message.headers["order"] as Order
        persister.restore(orderStateMachine, order)
        // 发送事件并获取第一个结果
        val result = orderStateMachine.sendEvent(Mono.just(message))
            .blockFirst()// 阻塞并获取第一个结果
        // 检查结果是否为空，并且事件是否被状态机接受
        persister.persist(orderStateMachine,order)
        return result != null && result.resultType == ResultType.ACCEPTED
    }


    companion object {
        
        private val log = KotlinLogging.logger {}
    }
}