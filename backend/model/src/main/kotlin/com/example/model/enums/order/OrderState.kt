package com.example.model.enums.order

import com.example.exception.EnumValueIsNotDefineException
import com.fasterxml.jackson.annotation.JsonCreator
import com.fasterxml.jackson.annotation.JsonValue
import org.babyfish.jimmer.sql.EnumItem
import org.babyfish.jimmer.sql.EnumType

@EnumType(EnumType.Strategy.ORDINAL)
enum class OrderState {
    /**
     * 等待支付
     */
    @EnumItem(ordinal = 0)
    PENDING,

    /**
     * 已支付
     */
    @EnumItem(ordinal = 1)
    PAYED,

    @EnumItem(ordinal = 2)
    CANCELED,

    @EnumItem(ordinal = 3)
    TIMED_OUT;

    @JsonValue
    fun serialize() = this.ordinal

    @JsonCreator
    fun deserialize(value: Int): OrderState =
        entries.getOrNull(value) ?: throw EnumValueIsNotDefineException()

}
