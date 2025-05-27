package com.example.utils

import cn.dev33.satoken.stp.StpUtil
import cn.dev33.satoken.stp.parameter.SaLoginParameter
import com.example.exception.UserNotBindStallException
import com.example.model.enums.Role

object MyStpUtils {
    fun getCurrentUserId() = StpUtil.getLoginIdAsLong()

    fun getCurrentUserRoleList(): List<String> = StpUtil.getRoleList(this.getCurrentUserId())

    fun getCurrentUserRole() = Role.getRoleByValue(this.getCurrentUserRoleList().first())

    fun getCurrentUserPermissionList(): List<String> = StpUtil.getPermissionList(this.getCurrentUserId())

    fun loginAndSetStallId(
        id: Long,
        stallId: Long? = null,
    ) = StpUtil.login(
        id,
        SaLoginParameter().setExtra(
            "stallId", stallId
        )
    )

    fun getCurrentStallId() =
        StpUtil.getExtra("stallId")?.toString()?.toLong() ?: throw UserNotBindStallException()
}