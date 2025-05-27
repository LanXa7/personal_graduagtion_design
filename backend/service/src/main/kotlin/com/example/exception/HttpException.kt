package com.example.exception

class FlaskRequestException
    : BusinessException(ErrorCode.FLASK_REQUEST_ERROR)

class FlaskRequestIdentifyException:
    BusinessException(ErrorCode.FLASK_REQUEST_IDENTIFY_ERROR)

class HttpRequestException(val code: Int? = null, val bodyString: String? = null, cause: Exception? = null) :
    RuntimeException()

class UnSupportedHttpResponseTypeException :
    BusinessException(ErrorCode.UN_SUPPORTED_HTTP_RESPONSE_TYPE)