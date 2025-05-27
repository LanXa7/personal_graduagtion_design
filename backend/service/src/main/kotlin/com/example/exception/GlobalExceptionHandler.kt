package com.example.exception

import cn.dev33.satoken.exception.NotLoginException
import cn.dev33.satoken.exception.NotRoleException
import io.github.oshai.kotlinlogging.KotlinLogging
import io.minio.errors.MinioException
import jakarta.validation.ConstraintViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.HttpStatusCode
import org.springframework.http.ProblemDetail
import org.springframework.http.ResponseEntity
import org.springframework.web.ErrorResponseException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import org.springframework.web.context.request.WebRequest
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

@RestControllerAdvice
class GlobalExceptionHandler : ResponseEntityExceptionHandler() {

    @ExceptionHandler(BusinessException::class)
    fun handleBusinessException(
        exception: BusinessException,
        request: WebRequest
    ): ResponseEntity<Any>? {
        log.error(exception) { "Business Error Handled ===> ${exception.message}" }
        val errorResponseException =
            buildErrorResponse(exception, errorCode = exception.errorCode)
        return buildResponseEntity(errorResponseException, request)
    }

    @ExceptionHandler(NotRoleException::class)
    fun handleNotRoleException(
        exception: NotRoleException,
        request: WebRequest
    ): ResponseEntity<Any>? {
        log.error(exception) { "SaToken Error Handled ===> ${exception.message}" }
        val errorResponseException =
            buildErrorResponse(exception, errorCode = ErrorCode.ROLE_ERROR.code)
        return buildResponseEntity(errorResponseException, request)
    }

    @ExceptionHandler(NotLoginException::class)
    fun handleNotLoginException(
        exception: NotLoginException,
        request: WebRequest
    ): ResponseEntity<Any>? {
        log.error(exception) { "SaToken Error Handled ===> ${exception.message}" }
        val errorResponseException =
            buildErrorResponse(exception, errorCode = ErrorCode.LOGIN_ERROR.code)
        return buildResponseEntity(errorResponseException, request)
    }


    @ExceptionHandler(ConstraintViolationException::class)
    fun handleValidationExceptions(
        exception: Exception,
        request: WebRequest
    ): ResponseEntity<Any>? {
        log.error(exception) { "Validation Error Handled ===> $exception" }
        val errorResponseException =
            buildErrorResponse(
                exception,
                status = HttpStatus.BAD_REQUEST,
            )
        return buildResponseEntity(errorResponseException, request)
    }

    @ExceptionHandler(MinioException::class)
    fun handleMinioException(
        exception: MinioException,
        request: WebRequest
    ): ResponseEntity<Any>? {
        log.error(exception) { "Minio Error Handled ===> ${exception.message}" }
        val errorResponseException =
            buildErrorResponse(exception, errorCode = ErrorCode.MINIO_ERROR.code)
        return buildResponseEntity(errorResponseException, request)
    }

    private fun buildProblemDetail(
        exception: Exception,
        status: HttpStatusCode? = null,
        errorCode: Int? = null,
    ) =
        ProblemDetail.forStatusAndDetail(
            status ?: HttpStatus.INTERNAL_SERVER_ERROR,
            exception.message
        ).apply {
            errorCode?.let { setProperty("code", it) }
            setProperty("timestamp", LocalDateTime.now().format(format))
        }

    private fun buildErrorResponse(
        exception: Exception,
        status: HttpStatusCode? = null,
        errorCode: Int? = null,
    ) =
        ErrorResponseException(
            status ?: HttpStatus.INTERNAL_SERVER_ERROR,
            buildProblemDetail(exception, status, errorCode),
            exception.cause
        )

    private fun buildResponseEntity(
        errorResponseException: ErrorResponseException,
        request: WebRequest
    ) =
        handleExceptionInternal(
            errorResponseException,
            null,
            errorResponseException.headers,
            errorResponseException.statusCode,
            request
        )

    @ExceptionHandler(Throwable::class)
    fun handleThrowable(
        exception: Throwable,
        request: WebRequest
    ): ResponseEntity<Any>? {
        log.error(exception) { "Throwable Handled ===> $exception" }
        val errorResponseException = ErrorResponseException(
            HttpStatus.INTERNAL_SERVER_ERROR,
            ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "System Error"
            ),
            exception.cause
        )
        return handleExceptionInternal(
            errorResponseException,
            errorResponseException.body,
            errorResponseException.headers,
            errorResponseException.statusCode,
            request
        )
    }


    companion object {
        private val format =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")

        
        private val log = KotlinLogging.logger {}

    }

}