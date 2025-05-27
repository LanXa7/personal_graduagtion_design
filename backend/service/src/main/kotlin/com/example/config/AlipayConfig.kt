package com.example.config

import com.alipay.api.internal.util.AlipayLogger
import com.example.config.properties.AliPayProperties
import com.ijpay.alipay.AliPayApiConfig
import com.ijpay.alipay.AliPayApiConfigKit
import io.github.oshai.kotlinlogging.KotlinLogging
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class AlipayConfig(
    private val aliPayProperties: AliPayProperties
) {

    @Bean
    fun getApiConfig(): AliPayApiConfig {
        log.info { "Init alipay config..." }
        val config = AliPayApiConfig.builder()
            .setAppId(aliPayProperties.appId)
            .setAliPayPublicKey(aliPayProperties.publicKey)
            .setAppCertPath(aliPayProperties.appCertPath)
            .setAliPayCertPath(aliPayProperties.alipayCertPath)
            .setAliPayRootCertPath(aliPayProperties.alipayRootCertPath)
            .setCharset("UTF-8")
            .setPrivateKey(aliPayProperties.privateKey)
            .setServiceUrl(aliPayProperties.serverUrl)
            .setSignType("RSA2")
            .buildByCert()
        AlipayLogger.setNeedEnableLogger(false)
        return AliPayApiConfigKit.putApiConfig(config)
    }

    companion object {
        private val log = KotlinLogging.logger {}
    }
}