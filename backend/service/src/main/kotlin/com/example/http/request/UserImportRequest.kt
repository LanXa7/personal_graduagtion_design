package com.example.http.request

import cn.idev.excel.annotation.ExcelProperty
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Pattern
import org.hibernate.validator.constraints.Length

data class UserImportRequest(
    @ExcelProperty(value = ["姓名"])
    @field:Length(min = 5, max = 20)
    var username: String? = "",
    @ExcelProperty(value = ["电话"])
    @field:Pattern(regexp = "^1[3-9]\\d{9}$")
    var phone: String? = "",
    @ExcelProperty(value = ["邮箱"])
    @field:Email
    var email: String? = "",
    @ExcelProperty(value = ["角色"])
    var role: String? = ""
)