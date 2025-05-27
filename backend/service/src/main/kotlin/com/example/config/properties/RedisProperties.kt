package com.example.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding

@ConfigurationProperties(value = "spring.data.redis")
data class RedisProperties @ConstructorBinding constructor(
    val host: String,
    val port: Int,
    val password: String,
    val database: Int
)