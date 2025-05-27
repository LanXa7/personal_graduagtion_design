package com.example.exception

class TokenGenerateErrorException :
    BusinessException(ErrorCode.TOKEN_GENERATE_ERROR)

class AlreadyOnTheBlacklistException :
    BusinessException(ErrorCode.ALREADY_ON_THE_BLACKLIST)