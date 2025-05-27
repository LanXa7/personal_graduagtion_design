package com.example.ext

import java.math.BigDecimal

fun BigDecimal.times(other: Int) =
    this.times(other.toBigDecimal())