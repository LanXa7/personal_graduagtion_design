package com.example.utils

import com.example.exception.HttpRequestException
import com.example.exception.UnSupportedHttpResponseTypeException

import com.example.ext.toJsonString
import io.github.oshai.kotlinlogging.KotlinLogging
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

typealias QueryParams = Map<String, String>
typealias HeaderParams = Map<String, String>

object HttpUtil {
    private const val DEFAULT_TIMEOUT_SECONDS = 60L
    private const val JSON_MEDIA_TYPE = "application/json; charset=utf-8"

    private val JSON = JSON_MEDIA_TYPE.toMediaType()

    
    private val log = KotlinLogging.logger {}

    private val CLIENT: OkHttpClient = OkHttpClient.Builder()
        .connectTimeout(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .readTimeout(DEFAULT_TIMEOUT_SECONDS, TimeUnit.SECONDS)
        .build()

    fun getAsString(url: String, queries: QueryParams = emptyMap(), headers: HeaderParams = emptyMap()): String? =
        sendRequest<String>("GET", url, queries, headers = headers)

    fun getAsBytes(url: String, queries: QueryParams = emptyMap(), headers: HeaderParams = emptyMap()): ByteArray? =
        sendRequest<ByteArray>("GET", url, queries, headers = headers)

    /**
     *  获取结果后 resp.toJsonNode()["字段名"]
     */
    fun post(
        url: String,
        queries: QueryParams = emptyMap(),
        bodyParam: Any? = null,
        headers: HeaderParams = emptyMap()
    ): String? = post(url, queries, bodyParam?.toJsonString()?.toRequestBody(JSON), headers)

    /**
     * post请求 获取返回的字节流数据
     */
    fun postAsBytes(
        url: String,
        bodyParam: Any? = null,
        queries: QueryParams = emptyMap(),
        headers: HeaderParams = emptyMap()
    ): ByteArray? = sendRequest("POST", url, queries, bodyParam?.toJsonString()?.toRequestBody(JSON), headers)

    /**
     * post 提交表单
     */
    fun postForm(
        url: String,
        queries: QueryParams = emptyMap(),
        bodyParam: QueryParams = emptyMap(),
        headers: HeaderParams = emptyMap()
    ): String? = post(url, queries, buildFormBody(bodyParam), headers)

    /**
     * post请求 请求体包括文件
     */
    fun postMultipart(
        url: String,
        queries: QueryParams = emptyMap(),
        formData: Map<String, Any> = emptyMap(),
        headers: HeaderParams = emptyMap()
    ): String? = post(url, queries, buildMultipartBody(formData), headers)

    fun deleteRequest(url: String, headers: HeaderParams = emptyMap()): Int {
        val request = Request.Builder()
            .url(url)
            .delete()
            .apply { headers.forEach { (key, value) -> addHeader(key, value) } }
            .build()

        CLIENT.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                log.error { "Delete request failed: ${response.code}: ${response.message}" }
            } else {
                log.info { "Delete request successful!" }
            }
            return response.code
        }
    }

    private fun post(
        url: String,
        queries: QueryParams,
        body: RequestBody?,
        headers: HeaderParams
    ): String? = sendRequest("POST", url, queries, body, headers)

    private inline fun <reified T> sendRequest(
        method: String,
        url: String,
        queries: QueryParams = emptyMap(),
        body: RequestBody? = null,
        headers: HeaderParams = emptyMap()
    ): T? {
        val request = buildRequest(method, url, queries, body, headers)

        log.debug { "Sending request: $method ${request.url}" }
        log.debug { "Request Headers: ${request.headers}" }
        log.debug { "Request Body: $body" }

        CLIENT.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                val code = response.code
                val bodyString = response.body.string()
                log.warn {
                    "Request failed. method: $method, url: $url, statusCode: $code, body: $bodyString"
                }
                throw HttpRequestException(code, bodyString)
            }

            return handleResponse(response)
        }
    }

    private fun buildRequest(
        method: String,
        url: String,
        queries: QueryParams,
        body: RequestBody?,
        headers: HeaderParams
    ): Request = Request.Builder()
        .method(method, body)
        .apply { headers.forEach { (key, value) -> addHeader(key, value) } }
        .url(buildUrlWithQueries(url, queries))
        .build()

    private fun buildUrlWithQueries(baseUrl: String, queries: QueryParams): String =
        if (queries.isEmpty()) baseUrl
        else "$baseUrl?${
            queries.map { (k, v) -> "${URLEncoder.encode(k, "UTF-8")}=${URLEncoder.encode(v, "UTF-8")}" }
                .joinToString("&")
        }"

    private fun buildFormBody(bodyParam: QueryParams): RequestBody =
        FormBody.Builder().apply { bodyParam.forEach { (key, value) -> add(key, value) } }.build()

    private fun buildMultipartBody(formData: Map<String, Any>): RequestBody =
        MultipartBody.Builder().setType(MultipartBody.FORM).apply {
            formData.forEach { (key, value) ->
                when (value) {
                    is String -> addFormDataPart(key, value)
                    is MultiPartBody -> addFormDataPart(
                        key,
                        value.filename,
                        value.bytes.toRequestBody(value.mediaType, 0, value.bytes.size)
                    )

                    else -> throw IllegalArgumentException("Unsupported data type: ${value::class.java.name}")
                }
            }
        }.build()

    private inline fun <reified T> handleResponse(response: Response): T? {
        return when (T::class) {
            String::class -> response.body.string() as T
            ByteArray::class -> response.body.bytes() as T
            else -> throw UnSupportedHttpResponseTypeException()
        }.also {
            log.debug { "Response received. Status: ${response.code}" }
            log.debug { "Response headers: ${response.headers}" }
            log.debug { "Response body: ${if (it is ByteArray) "bytes size ${it.size}" else it}" }
        }
    }
}


data class MultiPartBody(val mediaType: MediaType, val filename: String, val bytes: ByteArray) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as MultiPartBody

        if (mediaType != other.mediaType) return false
        if (filename != other.filename) return false
        if (!bytes.contentEquals(other.bytes)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = mediaType.hashCode()
        result = 31 * result + filename.hashCode()
        result = 31 * result + bytes.contentHashCode()
        return result
    }
}