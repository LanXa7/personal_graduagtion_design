package com.example.config

import com.example.exception.OrderIsNotFoundException
import com.example.model.entity.order.Order
import com.example.model.enums.order.OrderEvents
import com.example.model.enums.order.OrderState
import com.example.utils.RedissonUtils
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.statemachine.StateMachineContext
import org.springframework.statemachine.StateMachinePersist
import org.springframework.statemachine.config.EnableStateMachine
import org.springframework.statemachine.config.StateMachineConfigurerAdapter
import org.springframework.statemachine.config.builders.StateMachineStateConfigurer
import org.springframework.statemachine.config.builders.StateMachineTransitionConfigurer
import org.springframework.statemachine.persist.DefaultStateMachinePersister
import java.util.*


@Configuration
@EnableStateMachine(name = ["orderStateMachine"])
class OrderStateMachineConfig(
    private val redissonUtils: RedissonUtils
) : StateMachineConfigurerAdapter<OrderState, OrderEvents>() {
    /**
     * 配置状态
     */
    override fun configure(states: StateMachineStateConfigurer<OrderState?, OrderEvents?>?) {
        states?.withStates()
            ?.initial(OrderState.PENDING)
            ?.states(EnumSet.allOf(OrderState::class.java))
    }


    /**
     * 配置状态转换事件关系
     */
    override fun configure(transitions: StateMachineTransitionConfigurer<OrderState?, OrderEvents?>?) {
        transitions
            ?.withExternal()
            ?.source(OrderState.PENDING)?.target(OrderState.PAYED)
            ?.event(OrderEvents.PAY)
            ?.and()
            ?.withExternal()
            ?.source(OrderState.PENDING)?.target(OrderState.CANCELED)
            ?.event(OrderEvents.CANCEL)
            ?.and()
            ?.withExternal()
            ?.source(OrderState.PENDING)?.target(OrderState.TIMED_OUT)
            ?.event(OrderEvents.TIME_OUT)
    }


    @Bean
    fun persister(): DefaultStateMachinePersister<OrderState, OrderEvents, Order> {
        return DefaultStateMachinePersister(
            object : StateMachinePersist<OrderState, OrderEvents, Order> {

                override fun write(context: StateMachineContext<OrderState?, OrderEvents?>?, order: Order?) {
                    val orderId = order?.id ?: throw OrderIsNotFoundException()
                    log.info { "保存状态机上下文到Redis, orderId: $orderId" }
                    redissonUtils.stateMachine.setOrderStateMachineContext(orderId, context)
                }

                override fun read(order: Order?): StateMachineContext<OrderState?, OrderEvents?>? {
                    val orderId = order?.id ?: throw OrderIsNotFoundException()
                    log.info { "从Redis读取状态机上下文, orderId: $orderId" }
                    val stateMachineContext = redissonUtils.stateMachine.getOrderStateMachineContext(orderId)
                    return stateMachineContext
                }

            }
        )
    }

    companion object {
        
        private val log = KotlinLogging.logger {}
    }
}