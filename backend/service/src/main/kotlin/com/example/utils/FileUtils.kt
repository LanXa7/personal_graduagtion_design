package com.example.utils

import com.example.exception.ExceedAvatarMaxSizeException
import com.example.exception.ExceedFoodPictureMaxSizeException
import com.example.exception.ExceedOrderPictureMaxSizeException
import org.springframework.stereotype.Component

@Component
class FileUtils {

    fun checkAvatarSize(fileSize: Long) {
        if (fileSize > AVATAR_MAX_SIZE) {
            throw ExceedAvatarMaxSizeException()
        }
    }

    fun checkFileSize(fileSize: Long) {
        if (fileSize > ORDER_PICTURE_SIZE_ERROR) {
            throw ExceedOrderPictureMaxSizeException()
        }
    }

    fun checkFoodPictureSize(fileSize: Long) {
        if(fileSize > FOOD_PICTURE_SIZE_ERROR) {
            throw ExceedFoodPictureMaxSizeException()
        }
    }


    companion object {
        private const val AVATAR_MAX_SIZE = 1024 * 100
        private const val ORDER_PICTURE_SIZE_ERROR = 5 * 1024 * 100
        private const val FOOD_PICTURE_SIZE_ERROR = 10 * 1024 * 100
    }
}