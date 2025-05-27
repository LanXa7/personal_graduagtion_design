package com.example

import com.example.config.properties.AliPayProperties
import org.babyfish.jimmer.client.EnableImplicitApi
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication
import org.springframework.scheduling.annotation.EnableScheduling

@SpringBootApplication
@EnableImplicitApi
@EnableScheduling
@EnableConfigurationProperties(AliPayProperties::class)
class GraduationDesignApplication

fun main(args: Array<String>) {
    runApplication<GraduationDesignApplication>(*args) {
        setDefaultProperties(mapOf("kotlin.version" to KotlinVersion.CURRENT.toString()))
    }
}
