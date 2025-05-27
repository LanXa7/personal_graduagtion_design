package com.example.controller

import com.example.utils.MinioUtils
import io.github.oshai.kotlinlogging.KotlinLogging
import io.minio.errors.ErrorResponseException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class ObjectController(
    private val minioUtils: MinioUtils
) {


    @GetMapping("/images/**")
    fun imageFetch(
        request: HttpServletRequest,
        response: HttpServletResponse
    ) {
        response.setHeader("Content-Type", "image/jpg")
        fetchImage(request, response)
    }

    private fun fetchImage(request: HttpServletRequest, response: HttpServletResponse) {
        val imagePath = request.servletPath.substring(7)
        val stream = response.outputStream
        if (imagePath.length <= 13) {
            response.status = HttpServletResponse.SC_NOT_FOUND
            stream.println("404 not found")
        } else {
            try {
                minioUtils.getObject(stream, imagePath)
                response.setHeader("Cache-Control", "max-age=2592000")
            } catch (ex: ErrorResponseException) {
                if (ex.response().code == HttpServletResponse.SC_NOT_FOUND) {
                    response.status = HttpServletResponse.SC_NOT_FOUND
                    stream.println("404 not found")
                } else {
                    log.error(ex) { "从Minio获取图片出现异常: ${ex.message}" }
                }
            }
        }
    }

    companion object{
        
        private val log = KotlinLogging.logger {}
    }
}