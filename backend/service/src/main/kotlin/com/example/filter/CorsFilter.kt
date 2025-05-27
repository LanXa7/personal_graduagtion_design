package com.example.filter

import com.example.model.common.Const
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpFilter
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

@Component
@Order(Const.ORDER_CORS)
class CorsFilter : HttpFilter() {
    override fun doFilter(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        this.addCorsHeaders(request, response)
        if ("OPTIONS".equals(request.method, ignoreCase = true)) {
            response.status = HttpServletResponse.SC_OK
            return
        }
        filterChain.doFilter(request, response)
    }

    private fun addCorsHeaders(
        request: HttpServletRequest,
        response: HttpServletResponse
    ) {
        response.addHeader("Access-Control-Allow-Origin", request.getHeader("Origin"))
        response.addHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
        response.addHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
        // 有效时间
        response.setHeader("Access-Control-Max-Age", "3600")
    }
}