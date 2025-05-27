package com.example.exception

class StallNotFoundException :
    BusinessException(ErrorCode.STALL_NOT_FOUND)