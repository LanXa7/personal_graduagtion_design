package com.example.exception


class TransactionErrorException() :
    BusinessException(ErrorCode.TRANSACTION_ERROR)

class RequestErrorBodyException() :
    BusinessException(ErrorCode.REQUEST_BODY_ERROR)