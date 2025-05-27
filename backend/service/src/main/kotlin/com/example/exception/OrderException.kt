package com.example.exception

class OrderIsNotFoundException:
    BusinessException(ErrorCode.ORDER_NOT_FOUND)