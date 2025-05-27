package com.example.model.enums

import com.example.exception.EnumValueIsNotDefineException
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue

enum class EmailType {
    REGISTER,
    RESET,
    MODIFY;

    @JsonValue
    fun serialize() =
        this.name.lowercase()

    @JsonCreator
    fun deserialize(value: String): EmailType =
        entries.firstOrNull { it.name.lowercase() == value } ?: throw EnumValueIsNotDefineException()

    companion object {
        fun from(value: String): EmailType =
            entries.firstOrNull { it.name.lowercase() == value } ?: throw EnumValueIsNotDefineException()
    }
}