package com.example.utils

import io.minio.*
import io.minio.messages.DeleteObject
import org.springframework.stereotype.Component
import org.springframework.web.multipart.MultipartFile
import java.io.OutputStream
import java.util.*

@Component
class MinioUtils(
    private val minioClient: MinioClient
) {

    fun initImageName() =
        UUID.randomUUID().toString().replace("-", "") + IMAGE_SUFFIX


    fun getArgs(file: MultipartFile, fileName: String): PutObjectArgs =
        PutObjectArgs.builder()
            .bucket(BUCKET_NAME)
            .stream(file.inputStream, file.size, DEFAULT_PART_SIZE)
            .`object`(fileName)
            .build()

    fun putObject(args: PutObjectArgs) {
        minioClient.putObject(args)
    }

    fun removeObject(name: String?) {
        if (name.isNullOrBlank())
            return
        val args = RemoveObjectArgs.builder()
            .bucket(BUCKET_NAME)
            .`object`(name)
            .build()
        minioClient.removeObject(args)
    }

    fun removeObjects(names: List<String>) {
        val args = RemoveObjectsArgs
            .builder()
            .bucket(BUCKET_NAME)
            .objects(
                names.map {
                    DeleteObject(it)
                }
            )
            .build()
        minioClient.removeObjects(args)
    }

    fun getObject(stream: OutputStream, file: String) {
        val args = GetObjectArgs.builder()
            .bucket(BUCKET_NAME)
            .`object`(file)
            .build()
        val response = minioClient.getObject(args)
        response.transferTo(stream)
    }


    companion object {
        private const val BUCKET_NAME = "canteen"
        private const val IMAGE_SUFFIX = ".png"
        private const val DEFAULT_PART_SIZE = -1L
    }
}