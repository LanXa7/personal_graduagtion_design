package com.example.model.common

import org.babyfish.jimmer.sql.MappedSuperclass

@MappedSuperclass
interface BaseCreator {
    val creator: Long
}