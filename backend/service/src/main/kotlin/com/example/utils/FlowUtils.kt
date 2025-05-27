package com.example.utils

import com.example.model.common.Const
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component

@Component
class FlowUtils(
    @param:Value("\${spring.web.verify.mail-limit}")
    private val verifyLimit: Int,
    private val redissonUtils: RedissonUtils
) {


    /**
     * 针对IP地址进行邮件验证码获取限流
     */
    fun verifyLimit(address: String) =
        this.limitOnceCheck(
            Const.VERIFY_EMAIL_LIMIT + address,
            verifyLimit
        )

    private val defaultAction = LimitAction { overclock -> !overclock }

    /**
     * 针对于单次频率限制，请求成功后，在冷却时间内不得再次进行请求，如3秒内不能再次发起请求
     * @param key 键
     * @param blockTime 限制时间
     * @return 是否通过限流检查
     */
    fun limitOnceCheck(key: String, blockTime: Int): Boolean {
        return internalCheck(key, 1, blockTime, defaultAction)
    }

    /**
     * 针对于单次频率限制，请求成功后，在冷却时间内不得再次进行请求
     * 如3秒内不能再次发起请求，如果不听劝阻继续发起请求，将限制更长时间
     * @param key 键
     * @param frequency 请求频率
     * @param baseTime 基础限制时间
     * @param upgradeTime 升级限制时间
     * @return 是否通过限流检查
     */
    fun limitOnceUpgradeCheck(key: String, frequency: Int, baseTime: Int, upgradeTime: Int): Boolean {
        return internalCheck(key, frequency, baseTime) { overclock ->
            if (overclock) {
                redissonUtils.flow.bucketSet(key, upgradeTime.toLong())
            }
            false
        }
    }

    /**
     * 针对于在时间段内多次请求限制，如3秒内限制请求20次，超出频率则封禁一段时间
     * @param counterKey 计数键
     * @param blockKey 封禁键
     * @param blockTime 封禁时间
     * @param frequency 请求频率
     * @param period 计数周期
     * @return 是否通过限流检查
     */
    fun limitPeriodCheck(counterKey: String, blockKey: String, blockTime: Int, frequency: Int, period: Int): Boolean {
        return internalCheck(counterKey, frequency, period) { overclock ->
            if (overclock) {
                redissonUtils.flow.bucketSet(blockKey, blockTime.toLong())
            }
            !overclock
        }
    }

    /**
     * 针对于在时间段内多次请求限制，如3秒内20次请求
     * @param counterKey 计数键
     * @param frequency 请求频率
     * @param period 计数周期
     * @return 是否通过限流检查
     */
    fun limitPeriodCounterCheck(counterKey: String, frequency: Int, period: Int): Boolean {
        return internalCheck(counterKey, frequency, period, defaultAction)
    }

    /**
     * 内部使用请求限制主要逻辑
     * @param key 计数键
     * @param frequency 请求频率
     * @param period 计数周期
     * @param action 限制行为与策略
     * @return 是否通过限流检查
     */
    private fun internalCheck(key: String, frequency: Int, period: Int, action: LimitAction): Boolean {
        return if (redissonUtils.flow.atomicLongIsExists(key)) {
            val value = redissonUtils.flow.atomicLongIncrementAndGet(key)
            action.run(value > frequency)
        } else {
            redissonUtils.flow.atomicLongInit(key, period.toLong())
            true
        }
    }

    /**
     * 内部使用，限制行为与策略
     */
    private fun interface LimitAction {
        fun run(overclock: Boolean): Boolean
    }
}