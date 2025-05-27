package com.example.model.common

object Const {
    // JWT令牌
    const val JWT_FREQUENCY = "jwt:frequency:"

    //邮箱验证码
    const val VERIFY_EMAIL_LIMIT = "verify:email:limit:"

    // 请求频率限制
    const val FLOW_LIMIT_COUNTER = "flow:counter:"
    const val FLOW_LIMIT_BLOCK = "flow:block:"

    // 过滤器优先级
    const val ORDER_FLOW_LIMIT = -101
    const val ORDER_CORS = -102

    // 消息队列
    const val MQ_MAIL = "mail"

    // role[]
    const val SUPER_ADMIN = "super_admin"
    const val CANTEEN_ADMIN = "canteen_admin"
    const val STALL_ADMIN = "stall_admin"
    const val NORMAL = "normal"

}