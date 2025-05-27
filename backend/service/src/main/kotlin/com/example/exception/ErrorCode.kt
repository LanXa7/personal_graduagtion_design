package com.example.exception

enum class ErrorCode(val code: Int, val message: String) {

    TRANSACTION_ERROR(50000, "transaction error"),

    /**
     * 用户没有找到
     */
    USER_NOT_FIND(50010, "用户没有找到"),

    /**
     * 用户名或密码错误
     */
    USERNAME_OR_PASSWORD_ERROR(50011, "用户名或密码错误"),

    /**
     * 用户名或邮箱已存在
     */
    USERNAME_OR_EMAIL_ALREADY_EXISTS(50012, "用户名或邮箱已存在"),

    /**
     * 验证码不存在
     */
    EMAIL_CODE_IS_NOT_EXIST(50013, "邮箱验证码不存在"),

    /**
     * 验证码不正确
     */
    EMAIL_CODE_IS_NOT_TRUE(50014, "邮箱验证码不正确"),

    /**
     * 原密码错误
     */
    OLD_PASSWORD_IS_NOT_TRUE(50015, "原密码错误"),

    /**
     * token生成失败
     */
    TOKEN_GENERATE_ERROR(50020, "token generate error"),

    /**
     * 已在黑名单中
     */
    ALREADY_ON_THE_BLACKLIST(50021, "already on the blacklist"),

    /**
     * 头像需要小于100M
     */
    AVATAR_MAX_SIZE_ERROR(500030, "头像需要小于100M"),

    ORDER_PICTURE_SIZE_ERROR(50011, "订单图片需要小于500M"),

    FOOD_PICTURE_SIZE_ERROR(50012, "食物图片需要小于200M"),

    /**
     * 该名字已被使用
     */
    CANTEEN_NAME_IS_ALREADY_USED(50040, "该名字已被使用"),

    /**
     * 请求flask出错
     */
    FLASK_REQUEST_ERROR(50050, "请求flask出错"),

    FLASK_REQUEST_IDENTIFY_ERROR(50051, "flask识别失败"),

    /**
     * 用户没有绑定摊位
     */
    USER_NOT_BIND_STALL(50060, "user not bind stall"),

    /**
     * 摊位没有找到
     */
    STALL_NOT_FOUND(50070, "stall not found"),

    ORDER_NOT_FOUND(50080,"order is not found"),

    FOOD_IS_NOT_FOUND(50090, "food is not found"),

    /**
     * 未登录
     */
    NO_LOGIN(401, "未登录"),

    /**
     * 无权限
     */
    ROLE_ERROR(402, "无权限"),

    /**
     * 账号或密码错误
     */
    LOGIN_ERROR(403, "账号或密码错误"),

    /**
     * Not Found
     */
    NOT_FOUND(404, "Not Found"),

    /**
     * 枚举值没有定义
     */
    ENUM_VALUE_IS_NOT_DEFINE(405, "value is not defined"),

    /**
     * Minio异常
     */
    MINIO_ERROR(407, "minio error"),

    /**
     * 不支持的HTTP响应类型
     */
    UN_SUPPORTED_HTTP_RESPONSE_TYPE(408, "unsupported http response type"),

    /**
     * 请求体有误
     */
    REQUEST_BODY_ERROR(1001, "request body error"),

    /**
     * 参数有误
     */
    PARAMETERS_ERROR(1000, "参数有误"),

    /**
     * 请求过快
     */
    TOO_MANY_REQUEST(429, "请求过快"),
}