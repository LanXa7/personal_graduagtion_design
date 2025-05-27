package com.example.utils

import cn.dev33.satoken.stp.StpInterface
import com.example.repository.user.RoleRepository
import org.springframework.stereotype.Component

@Component
class RolePermissionReader(
    private val roleRepository: RoleRepository
) : StpInterface {

    override fun getPermissionList(
        loginId: Any,
        loginType: String
    ): List<String> =
        roleRepository.getPermissionsByUserId(loginId.toString().toLong())

    override fun getRoleList(
        loginId: Any,
        loginType: String
    ): List<String> =
        roleRepository.getCodesByUserId(loginId.toString().toLong())
}