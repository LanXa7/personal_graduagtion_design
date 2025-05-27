package com.example.controller

import com.example.utils.IpUtils
import com.example.utils.RedissonUtils
import jakarta.servlet.http.HttpServletRequest
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/test")
class TestController(
    private val redissonUtils: RedissonUtils,
    private val sql: KSqlClient
) {

    @GetMapping("/captcha")
    fun getCaptcha(
        @RequestParam email: String,
        request: HttpServletRequest
    ): String {
        val ip = IpUtils.getClientIp(request)
        val canGetEmailToken = redissonUtils.auth.tryAcquireCaptchaHourRateLimiter(email)
        val canGetIpToken = redissonUtils.auth.tryAcquireCaptchaHourRateLimiter(ip, asIp = true)
        if (!canGetEmailToken || !canGetIpToken) {
            throw Exception("get three verification code within a hour")
        }
        val emailMinuteAtomicLong = redissonUtils.auth.addCaptchaMinuteAtomicLong(email)
        val ipMinuteRAtomicLong = redissonUtils.auth.addCaptchaMinuteAtomicLong(ip, asIp = true)
        if (emailMinuteAtomicLong >= 1 || ipMinuteRAtomicLong >= 1) {
            throw Exception("get a verification code within a minute")
        }
        return "LanXa7"
    }

}