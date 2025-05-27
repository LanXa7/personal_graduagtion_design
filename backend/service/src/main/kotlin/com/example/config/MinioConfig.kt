package com.example.config

import io.github.oshai.kotlinlogging.KotlinLogging
import io.minio.MinioClient
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class MinioConfig(
    @param:Value($$"${spring.minio.endpoint}")
    val endpoint: String,
    @param:Value($$"${spring.minio.username}")
    val username: String,
    @param:Value($$"${spring.minio.password}")
    val password: String,
) {
    @Bean
    fun minioClient(): MinioClient {
        log.info { "Init minio client..." }
        return MinioClient.builder()
            .endpoint(endpoint)
            .credentials(username, password)
            .build()
    }

    companion object {
        
        private val log = KotlinLogging.logger {}
    }
}