package com.example.exception

import jdk.internal.joptsimple.internal.Messages.message

class UnknownMimeTypeException :
    BusinessException(ErrorCode.UNKNOWN_MIME_TYPE)