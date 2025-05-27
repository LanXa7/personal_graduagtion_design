package com.example.utils

import cn.dev33.satoken.jwt.SaJwtTemplate
import cn.dev33.satoken.jwt.SaJwtUtil
import cn.hutool.jwt.JWT
import com.example.exception.AlreadyOnTheBlacklistException
import com.example.exception.TokenGenerateErrorException
import com.example.model.common.Const
import jakarta.annotation.PostConstruct
import org.redisson.api.RedissonClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*

@Component
class JwtUtils(
    @param:Value("\${spring.security.jwt.limit.base}")
    private val limitBase: Int,
    @param:Value("\${spring.security.jwt.limit.upgrade}")
    private val limitUpgrade: Int,
    @param:Value("\${spring.security.jwt.limit.frequency}")
    private val limitFrequency: Int,
    private val redissonClient: RedissonClient,
    private val flowUtils: FlowUtils,
    private val redissonUtils: RedissonUtils
) {

    /**
     * 让指定Jwt令牌失效
     *
     * @param headerToken 请求头中携带的令牌
     * @return 是否操作成功
     */
    fun invalidateJwt(headerToken: String): Boolean {
        val jwt = JWT.of(headerToken)
        val payloads = jwt.payloads
        return deleteToken(
            payloads.getStr("jwtId"), payloads.getLong("eff")
        )
    }

    @PostConstruct
    fun setSaJwtTemplate() {
        SaJwtUtil.setSaJwtTemplate(object : SaJwtTemplate() {
            override fun generateToken(
                jwt: JWT, keyt: String
            ): String {
                val loginId = jwt.payloads.getLong("loginId")
                return if (frequencyCheck(loginId)) {
                    jwt.setPayload(
                        "jwtId", UUID.randomUUID().toString()
                    )
                    super.generateToken(jwt, keyt)
                } else {
                    throw TokenGenerateErrorException()
                }
            }

            override fun parseToken(
                token: String,
                loginType: String,
                keyt: String,
                isCheckTimeout: Boolean
            ): JWT? {
                val jwt = JWT.of(token)
                val payloads = jwt.payloads
                if (redissonUtils.jwt.isInvalidToken(payloads.getStr("jwtId")))
                    return null
                if (redissonUtils.jwt.isInvalidUser(payloads.getLong("loginId")))
                    return null
                return super.parseToken(
                    token, loginType, keyt, isCheckTimeout
                )
            }
        })
    }

    /**
     * 频率检测，防止用户高频申请Jwt令牌，并且采用阶段封禁机制
     * 如果已经提示无法登录的情况下用户还在刷，那么就封禁更长时间
     *
     * @param userId 用户ID
     * @return 是否通过频率检测
     */
    private fun frequencyCheck(userId: Long): Boolean {
        val key = "${Const.JWT_FREQUENCY}$userId"
        return flowUtils.limitOnceUpgradeCheck(
            key, limitFrequency, limitBase, limitUpgrade
        )
    }

    /**
     * 将Token列入Redis黑名单中
     *
     * @param uuid    令牌ID
     * @param effTime 过期时间
     * @return 是否操作成功
     */
    private fun deleteToken(uuid: String, effTime: Long): Boolean {
        if (redissonUtils.jwt.isInvalidToken(uuid)) {
            throw AlreadyOnTheBlacklistException()
        }
        val expire = maxOf(effTime - System.currentTimeMillis(), 0)
        redissonUtils.jwt.addBlacklist(uuid, expire)
        return true
    }


}