package com.example.config

import com.example.config.properties.RedisProperties
import org.redisson.Redisson
import org.redisson.api.RedissonClient
import org.redisson.config.Config
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.io.ResourceLoader
import org.springframework.data.redis.connection.RedisConnectionFactory
import org.springframework.data.redis.core.RedisTemplate
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer
import org.springframework.data.redis.serializer.RedisSerializer
import org.springframework.data.redis.serializer.StringRedisSerializer


@Configuration
@EnableConfigurationProperties(RedisProperties::class)
class RedisConfig(
    private val resourceLoader: ResourceLoader,
    private val redisProperties: RedisProperties
) {
    @Bean
    fun redisTemplate(redisConnectionFactory: RedisConnectionFactory): RedisTemplate<String, Any> {
        val template = RedisTemplate<String, Any>()
        template.connectionFactory = redisConnectionFactory

        // 使用 String 序列化器来序列化 key
        val stringSerializer: RedisSerializer<String> = StringRedisSerializer()
        template.keySerializer = stringSerializer
        template.hashKeySerializer = stringSerializer

        // 使用 Jackson 序列化器来序列化 value
        val jackson2JsonRedisSerializer: RedisSerializer<Any> = GenericJackson2JsonRedisSerializer()
        template.valueSerializer = jackson2JsonRedisSerializer
        template.hashValueSerializer = jackson2JsonRedisSerializer

        template.afterPropertiesSet()
        return template
    }

    @Bean
    fun redissonClient(): RedissonClient {
        val resource = resourceLoader.getResource(REDISSON_YAML_PATH)
        val config = Config.fromYAML(resource.inputStream)
        config.useSingleServer().apply {
            this.address = "redis://${redisProperties.host}:${redisProperties.port}"
            this.password = redisProperties.password
            this.database = redisProperties.database
        }
        return Redisson.create(config)
    }

    companion object {
        private const val REDISSON_YAML_PATH = "classpath:yml/redisson.yaml"
    }

}