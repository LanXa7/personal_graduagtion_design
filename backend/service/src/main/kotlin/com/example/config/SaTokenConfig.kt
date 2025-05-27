package com.example.config

import cn.dev33.satoken.interceptor.SaInterceptor
import cn.dev33.satoken.jwt.StpLogicJwtForStateless
import cn.dev33.satoken.stp.StpLogic
import cn.dev33.satoken.stp.StpUtil
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.servlet.config.annotation.InterceptorRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer

@Configuration
class SaTokenConfig : WebMvcConfigurer {

    @Bean
    fun getStpLogicJwt(): StpLogic = StpLogicJwtForStateless()

    override fun addInterceptors(registry: InterceptorRegistry) {
        registry.addInterceptor(SaInterceptor {
            StpUtil.checkLogin()
        }).addPathPatterns("/**")
            .excludePathPatterns("/favicon.ico")
            .excludePathPatterns("/webhook/**")
            .excludePathPatterns(
                "/openapi.html",
                "/openapi.yaml",
                "/openapi.json"
            )
            .excludePathPatterns("/ts.zip")
            .excludePathPatterns(
                "/auth/sign_in",
                "/auth/sign_up",
                "/auth/code",
                "/auth/confirm",
                "/auth/password"
            )
            .excludePathPatterns("/ws/**")
            .excludePathPatterns("/images/**")
            .excludePathPatterns("/dict")
            .excludePathPatterns("/test/**")
    }
}