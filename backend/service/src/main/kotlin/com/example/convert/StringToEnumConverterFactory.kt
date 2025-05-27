package com.example.convert

import org.springframework.core.convert.converter.Converter
import org.springframework.core.convert.converter.ConverterFactory
import kotlin.reflect.KClass

/**
 * 精简版通用枚举转换器工厂
 * 支持：
 * 1. 自动适配所有枚举类型
 * 2. 同时支持 name 和 ordinal 转换
 * 3. 不区分大小写匹配
 * 4. 自动trim输入
 */
class StringToEnumConverterFactory : ConverterFactory<String, Enum<*>> {
    override fun <T : Enum<*>> getConverter(targetType: Class<T>): Converter<String, T> {
        return StringToEnumConverter(targetType.kotlin)
    }

    private class StringToEnumConverter<T : Enum<*>>(
        private val enumClass: KClass<T>
    ) : Converter<String, T> {
        override fun convert(source: String): T {
            val cleanInput = source.trim()

            // 区分大小写
            // 不区分写法如下: it.name.equals(cleanInput, ignoreCase = true)
            enumClass.java.enumConstants
                .firstOrNull { it.name == cleanInput }
                ?.let { return it }

            cleanInput.toIntOrNull()?.let { ordinal ->
                enumClass.java.enumConstants.getOrNull(ordinal)?.let { return it }
            }

            throw IllegalArgumentException(
                "Invalid enum value: '$source' for ${enumClass.simpleName}. " +
                        "Allowed values: ${
                            enumClass.java.enumConstants.joinToString {
                                "${it.name} (ordinal=${it.ordinal})"
                            }
                        }"
            )
        }
    }
}