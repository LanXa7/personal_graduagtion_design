package com.example.ext

import org.springframework.web.context.request.RequestAttributes
import org.springframework.web.context.request.RequestContextHolder

fun vt(
    asStart: Boolean = true,
    name: String? = null,
    contextClassLoader: ClassLoader? = null,
    block: () -> Unit
): Thread {
    val requestAttributes: RequestAttributes? = RequestContextHolder.getRequestAttributes()

    val builder = Thread.ofVirtual().also { vt ->
        name?.let { vt.name(name) }
    }

    val thread = builder.unstarted {
        try {
            // 设置RequestAttributes到当前虚拟线程
            setRequestAttributes(requestAttributes)

            // 设置ContextClassLoader
            withContextClassLoader(contextClassLoader) {
                block()
            }
        } catch (ex: Exception) {
            ex.printStackTrace()
            throw ex
        } finally {
            RequestContextHolder.resetRequestAttributes()
        }
    }

    if (asStart) {
        thread.start()
    }
    return thread
}

private fun setRequestAttributes(requestAttributes: RequestAttributes?) {
    if (requestAttributes != null) {
        RequestContextHolder.setRequestAttributes(requestAttributes)
    }
}

private fun withContextClassLoader(contextClassLoader: ClassLoader?, block: () -> Unit) {
    if (contextClassLoader != null) {
        val originalClassLoader = Thread.currentThread().contextClassLoader
        Thread.currentThread().contextClassLoader = contextClassLoader
        try {
            block()
        } finally {
            Thread.currentThread().contextClassLoader = originalClassLoader
        }
    } else {
        block()
    }
}