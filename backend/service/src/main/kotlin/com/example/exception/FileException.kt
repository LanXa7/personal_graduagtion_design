package com.example.exception

class ExceedAvatarMaxSizeException :
    BusinessException(ErrorCode.AVATAR_MAX_SIZE_ERROR)

class ExceedOrderPictureMaxSizeException:
    BusinessException(ErrorCode.ORDER_PICTURE_SIZE_ERROR)

class ExceedFoodPictureMaxSizeException:
    BusinessException(ErrorCode.FOOD_PICTURE_SIZE_ERROR)