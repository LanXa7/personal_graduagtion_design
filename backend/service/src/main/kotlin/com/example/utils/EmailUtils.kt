package com.example.utils

import com.example.exception.ErrorCode
import com.example.model.common.Const
import com.example.model.enums.EmailType
import org.redisson.api.RLock
import org.springframework.amqp.rabbit.core.RabbitTemplate
import org.springframework.stereotype.Component
import kotlin.random.Random

@Component
class EmailUtils(
    private val rabbitTemplate: RabbitTemplate,
    private val redissonUtils: RedissonUtils,
    private val flowUtils: FlowUtils
) {

    fun getVerifyCode(
        email: String,
        type: EmailType,
        address: String
    ) = sendCodeMail(email, type, address)

    private fun sendCodeMail(email: String, type: EmailType, address: String) {
        val lock: RLock = redissonUtils.auth.getLock(address.intern())
        lock.lock()
        if (!flowUtils.verifyLimit(address)) {
            throw Exception(ErrorCode.TOO_MANY_REQUEST.message)
        }
        val code = Random.nextInt(899999) + 100000
        val data: Map<String, Any> = mapOf(
            "type" to type,
            "email" to email,
            "code" to code
        )
        rabbitTemplate.convertAndSend(Const.MQ_MAIL, data)
        redissonUtils.auth.setCode(email, code.toString())
        lock.unlock()
    }
}