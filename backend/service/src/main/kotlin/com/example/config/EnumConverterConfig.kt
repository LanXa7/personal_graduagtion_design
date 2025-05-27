package com.example.config

import com.example.convert.StringToEnumConverterFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.core.convert.converter.ConverterFactory
import org.springframework.format.FormatterRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class EnumConverterConfig : WebMvcConfigurer {
    @Bean
    fun enumConverterFactory(): ConverterFactory<String, Enum<*>> {
        return StringToEnumConverterFactory()
    }

    override fun addFormatters(registry: FormatterRegistry) {
        // 移除Spring默认的枚举转换器
        registry.removeConvertible(String::class.java, Enum::class.java)
        registry.addConverterFactory(StringToEnumConverterFactory())
    }
}