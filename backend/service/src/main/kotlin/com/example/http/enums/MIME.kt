package com.example.http.enums

import com.example.exception.UnknownMimeTypeException

enum class MIME(val mimeType: String, val ext: String) {
    AUDIO_MP3("audio/mpeg", "mp3"),
    AUDIO_WEBM("audio/webm", "webm"),
    AUDIO_WAV("audio/wav", "wav"),
    VIDEO_MP4("video/mp4", "mp4"),
    VIDEO_WEBM("video/webm", "webm"),
    IMAGE_PNG("image/png", "png"),
    IMAGE_JPG("image/jpeg", "jpg"),
    IMAGE_JPEG("image/jpeg", "jpeg"),
    IMAGE_GIF("image/gif", "gif"),
    APPLICATION_BIN("application/octet-stream", "bin"),
    APPLICATION_JSON("application/json", "json"),
    APPLICATION_PDF("application/pdf", "pdf"),
    APPLICATION_PPT("application/vnd.ms-powerpoint", "ppt"),
    APPLICATION_PPTX("application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"),
    VTT("text/vtt", "vtt");

    companion object {
        private val mimeTypeToEnum = entries.associateBy { it.mimeType }
        private val extToEnum = entries.associateBy { it.ext }

        /**
         * 检查是否支持指定的 MIME 类型。
         */
        fun supports(mimeType: String): Boolean = mimeType in mimeTypeToEnum

        /**
         * 根据 MIME 类型获取对应的枚举值。
         * @throws IllegalArgumentException 如果 MIME 类型不支持。
         */
        fun fromMimeType(mimeType: String): MIME {
            return mimeTypeToEnum[mimeType]
                ?: throw IllegalArgumentException("Unsupported MIME type: $mimeType")
        }

        /**
         * 根据文件扩展名获取对应的枚举值。
         * @throws com.example.exception.UnknownMimeTypeException 如果扩展名不支持或无法确定 MIME 类型。
         */
        fun fromExt(ext: String): MIME {
            return extToEnum[ext]
                ?: throw UnknownMimeTypeException()
        }
    }
}