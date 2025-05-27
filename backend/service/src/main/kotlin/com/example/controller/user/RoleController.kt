package com.example.controller.user

import com.example.model.entity.user.Role
import com.example.service.user.RoleService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/role")
class RoleController(
    private val roleService: RoleService
) {

    @GetMapping
    fun queryRoles(): List<Role> =
        roleService.queryRoles()






}