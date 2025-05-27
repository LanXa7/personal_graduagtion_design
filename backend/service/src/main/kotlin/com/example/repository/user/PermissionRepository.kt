package com.example.repository.user

import com.example.model.entity.user.Permission
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.springframework.stereotype.Repository

@Repository
class PermissionRepository(
    sql:KSqlClient
) :AbstractKotlinRepository<Permission,Long>(sql){
}