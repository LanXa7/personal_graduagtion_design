package com.example.utils

import jakarta.servlet.http.HttpServletRequest

object IpUtils {
    /**
     * 获取客户端的 IP 地址
     */
    fun getClientIp(request: HttpServletRequest): String {
        // 定义需要检查的 HTTP 头字段
        val headers = listOf(
            "X-Forwarded-For",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED",
            "HTTP_VIA",
            "REMOTE_ADDR"
        )

        // 遍历头字段，找到第一个有效的 IP 地址
        val ipAddress = headers.firstNotNullOfOrNull { header ->
            request.getHeader(header)?.takeIf { it.isNotEmpty() && !it.equals("unknown", ignoreCase = true) }
        } ?: request.remoteAddr

        // 如果存在多个 IP（如 X-Forwarded-For 中的情况），取第一个 IP
        return ipAddress.split(",").first().trim().replace(":", ".")
    }
}