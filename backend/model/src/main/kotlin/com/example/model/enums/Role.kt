package com.example.model.enums

import com.example.exception.EnumValueIsNotDefineException
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import org.babyfish.jimmer.sql.EnumItem
import org.babyfish.jimmer.sql.EnumType

@EnumType(EnumType.Strategy.NAME)
enum class Role {
    /**
     * 普通用户
     */
    @EnumItem(name = "normal")
    NORMAL,

    @EnumItem(name = "stall_admin")
    STALL_ADMIN,

    /**
     * 食堂管理员
     */
    @EnumItem(name = "canteen_admin")
    CANTEEN_ADMIN,

    /**
     * 系统管理员
     */
    @EnumItem(name = "super_admin")
    SUPER_ADMIN;

    @JsonValue
    fun serialize() =
        this.name.lowercase()

    @JsonCreator
    fun deserialize(value: String): Role =
        entries.firstOrNull { it.name.lowercase() == value } ?: throw EnumValueIsNotDefineException()

    companion object {
        fun getRoleByValue(value: String): Role =
            entries.firstOrNull { it.name.lowercase() == value }
                ?: throw EnumValueIsNotDefineException()

    }
}