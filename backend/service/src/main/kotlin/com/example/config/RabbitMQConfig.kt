package com.example.config

import org.springframework.amqp.core.Queue
import org.springframework.amqp.core.QueueBuilder
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter
import org.springframework.amqp.support.converter.MessageConverter
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class RabbitMQConfig {
    @Bean("emailQueue")
    fun emailQueue(): Queue =
        QueueBuilder
            .durable("mail")
            .build()

    @Bean
    fun messageConverter(): MessageConverter =
        Jackson2JsonMessageConverter()

}