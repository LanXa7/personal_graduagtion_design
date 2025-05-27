package com.example.filter

import com.example.ext.toJsonString
import com.example.model.common.Const
import com.example.utils.FlowUtils
import com.example.utils.RedissonUtils
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpFilter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.redisson.api.RLock
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

@Component
@Order(Const.ORDER_FLOW_LIMIT)
class FlowLimitingFilter(
    @param:Value("\${spring.web.flow.limit}")
    private val limit: Int,
    @param:Value("\${spring.web.flow.period}")
    private val period: Int,
    @param:Value("\${spring.web.flow.block}")
    private val block: Int,
    private val flowUtils: FlowUtils,
    private val redissonUtils: RedissonUtils
) : HttpFilter() {

    override fun doFilter(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val address = request.remoteAddr
        if (request.method != "OPTIONS" && !tryCount(address)) {
            writeBlockMessage(response)
        } else {
            filterChain.doFilter(request, response)
        }
    }

    /**
     * 尝试对指定IP地址请求计数，如果被限制则无法继续访问
     * @param address 请求IP地址
     * @return 是否操作成功
     */
    private fun tryCount(address: String): Boolean {
        val lock: RLock = redissonUtils.flow.getLock(address) // 使用 Redisson 分布式锁
        return try {
            lock.lock() // 加锁
            if (redissonUtils.flow.isFlowLimitBlockKeyIsExists(address)) {
                false
            } else {
                val counterKey = "${Const.FLOW_LIMIT_COUNTER}$address"
                val blockKey = "${Const.FLOW_LIMIT_BLOCK}$address"
                flowUtils.limitPeriodCheck(counterKey, blockKey, block, limit, period)
            }
        } finally {
            lock.unlock() // 释放锁
        }
    }

    /**
     * 为响应编写拦截内容，提示用户操作频繁
     * @param response 响应
     */
    private fun writeBlockMessage(response: HttpServletResponse) {
        response.status = 429
        response.contentType = "application/json;charset=utf-8"
        val problemDetails = mapOf(
            "title" to "Too Many Requests",
            "status" to 429,
            "detail" to "The user has sent too many requests in a given amount of time.",
        )
        response.writer.write(problemDetails.toJsonString())
    }
}