package com.example.model.common

import org.babyfish.jimmer.sql.MappedSuperclass
import java.time.LocalDateTime

@MappedSuperclass
interface BaseTime {
    val createTime: LocalDateTime

    val modifyTime: LocalDateTime?
}