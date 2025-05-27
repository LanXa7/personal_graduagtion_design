package com.example.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.ConstructorBinding

@ConfigurationProperties(prefix = "alipay")
data class AliPayProperties @ConstructorBinding constructor(
    val appId: String,
    val privateKey: String,
    val publicKey: String,
    val appCertPath: String,
    val alipayCertPath: String,
    val alipayRootCertPath: String,
    val serverUrl: String
)