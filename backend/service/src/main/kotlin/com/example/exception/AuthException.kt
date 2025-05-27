package com.example.exception

class UserNotFoundException :
    BusinessException(ErrorCode.USER_NOT_FIND)

class UsernameOrPasswordException :
    BusinessException(ErrorCode.USERNAME_OR_PASSWORD_ERROR)

class UsernameOrEmailAlreadyExistsException :
    BusinessException(ErrorCode.USERNAME_OR_EMAIL_ALREADY_EXISTS)

class CodeIsNotExistsException :
    BusinessException(ErrorCode.EMAIL_CODE_IS_NOT_EXIST)

class CodeIsNotTrueException :
    BusinessException(ErrorCode.EMAIL_CODE_IS_NOT_TRUE)

class OldPasswordException :
    BusinessException(ErrorCode.OLD_PASSWORD_IS_NOT_TRUE)