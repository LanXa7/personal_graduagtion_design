package com.example.service.user

import com.example.model.entity.user.Role
import com.example.model.entity.user.by
import com.example.repository.user.RoleRepository
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.stereotype.Service

@Service
class RoleService(
    private val roleRepository: RoleRepository
) {
    fun queryRoles() =
        roleRepository.findAll(ROLES_FETCHER) {
            desc(Role::createTime)
        }


    companion object {
        private val ROLES_FETCHER = newFetcher(Role::class).by {
            code()
            createTime()
        }
    }
}