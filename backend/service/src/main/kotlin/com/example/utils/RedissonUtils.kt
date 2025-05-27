package com.example.utils

import com.example.model.enums.order.OrderEvents
import com.example.model.enums.order.OrderState
import org.redisson.api.*
import org.springframework.statemachine.StateMachineContext
import org.springframework.stereotype.Component
import java.time.Duration

@Component
class RedissonUtils(
    redissonClient: RedissonClient
) {
    val jwt = JwtModule(redissonClient)
    val flow = FlowModule(redissonClient)
    val auth = AuthModule(redissonClient)
    val ws = WebSocketModule(redissonClient)
    val stateMachine = StateMachine(redissonClient)
}


object Constants {
    // JWT令牌
    const val JWT_BLACK_LIST = "jwt:blacklist:"

    // 用户黑名单
    const val USER_BLACK_LIST = "user:blacklist:"

    const val FLOW_LIMIT_BLOCK = "flow:block:"

    // 邮件验证码
    const val VERIFY_EMAIL_DATA = "verify:email:data:"

    // 邮件验证码过期时间
    const val CODE_EXPIRED = 3L
}


class JwtModule(private val redissonClient: RedissonClient) {
    private fun jwtBucket(uuid: String) =
        redissonClient.getBucket<String>(
            "${Constants.JWT_BLACK_LIST}$uuid"
        )

    fun isInvalidToken(uuid: String): Boolean =
        jwtBucket(uuid).isExists

    fun addBlacklist(uuid: String, expire: Long) =
        jwtBucket(uuid).set("", Duration.ofMillis(expire))

    fun isInvalidUser(uid: Long): Boolean =
        redissonClient.getBucket<String>(
            "${Constants.USER_BLACK_LIST}$uid"
        ).isExists

}

class FlowModule(private val redissonClient: RedissonClient) {
    fun getLock(address: String): RLock =
        redissonClient.getLock(address)

    fun isFlowLimitBlockKeyIsExists(address: String) =
        redissonClient.getBucket<String>("${Constants.FLOW_LIMIT_BLOCK}$address").isExists

    private fun atomicLong(key: String) =
        redissonClient.getAtomicLong(key)

    fun atomicLongIsExists(key: String) =
        atomicLong(key).isExists

    fun atomicLongIncrementAndGet(key: String) =
        atomicLong(key).incrementAndGet()

    fun atomicLongInit(key: String, period: Long) {
        atomicLong(key).set(1)
        atomicLong(key).expire(Duration.ofSeconds(period))
    }

    fun bucketSet(key: String, blockTime: Long) =
        redissonClient.getBucket<String>(key).set("1", Duration.ofSeconds(blockTime))


}

class AuthModule(private val redissonClient: RedissonClient) {

    fun getLock(key: String): RLock =
        redissonClient.getLock(key)

    fun setCode(email: String, code: String) =
        emailVerifyCodeBucket(email).set(code, Duration.ofMinutes(Constants.CODE_EXPIRED))

    private fun emailVerifyCodeBucket(email: String) =
        redissonClient.getBucket<String>(Constants.VERIFY_EMAIL_DATA + email)

    fun getEmailVerifyCode(email: String): String? =
        emailVerifyCodeBucket(email).get()

    fun deleteEmailVerifyCode(email: String) =
        emailVerifyCodeBucket(email).delete()

    private fun captchaMinuteAtomicLong(name: String, asIp: Boolean = false): RAtomicLong {
        val atomicLong = if (asIp) {
            redissonClient.getAtomicLong("captcha:atomicLong:minute:ip:$name")
        } else {
            redissonClient.getAtomicLong("captcha:atomicLong:email:$name")
        }
        atomicLong.expire(Duration.ofMinutes(1))
        return atomicLong
    }

    fun addCaptchaMinuteAtomicLong(type: String, asIp: Boolean = false) =
        captchaMinuteAtomicLong(type, asIp).getAndIncrement().toInt()

    private fun captchaHourRateLimiter(name: String, asIp: Boolean = false): RRateLimiter {
        val rateLimiter = if (asIp) {
            redissonClient.getRateLimiter("captcha:rateLimiter:minute:ip:$name")
        } else {
            redissonClient.getRateLimiter("captcha:rateLimiter:minute:email:$name")
        }
        rateLimiter.trySetRate(RateType.OVERALL, 3, Duration.ofHours(1))
        rateLimiter.expire(Duration.ofHours(1))
        return rateLimiter
    }

    fun tryAcquireCaptchaHourRateLimiter(type: String, asIp: Boolean = false) =
        captchaHourRateLimiter(type, asIp).tryAcquire()


}

class WebSocketModule(private val redissonClient: RedissonClient) {

    private fun orderCodeBucket(orderCode: String): RBucket<String> =
        redissonClient.getBucket("orderCode:$orderCode")

    fun setOrderCode(orderCode: String) =
        orderCodeBucket(orderCode).set("", Duration.ofMinutes(3))

    fun isOrderCodeExist(orderCode: String) =
        orderCodeBucket(orderCode).isExists

    fun deleteOrderCode(orderCode: String) {
        orderCodeBucket(orderCode).delete()
    }


}

class StateMachine(private val redissonClient: RedissonClient) {

    private fun orderStateMachineBucket(orderId: Long) =
        redissonClient.getBucket<StateMachineContext<OrderState?, OrderEvents?>?>("orderStateMachine:$orderId")

    fun setOrderStateMachineContext(
        orderId: Long,
        context: StateMachineContext<OrderState?, OrderEvents?>?
    ) {
        orderStateMachineBucket(orderId).set(context)
    }

    fun getOrderStateMachineContext(
        orderId: Long
    ) =
        orderStateMachineBucket(orderId).get()


}

