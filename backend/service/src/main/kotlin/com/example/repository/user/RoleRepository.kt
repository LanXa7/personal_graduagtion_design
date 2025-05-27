package com.example.repository.user

import com.example.model.entity.user.*
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.eq
import org.springframework.stereotype.Repository

@Repository
class RoleRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<Role, Long>(sql) {

    fun getCodesByUserId(userId: Long): List<String> =
        executeQuery {
            where(table.users {
                this.id eq userId
            })
            select(table.code)
        }.map {
            it.serialize()
        }

    fun getPermissionsByUserId(userId: Long): List<String> =
        executeQuery {
            where(table.users {
                this.id eq userId
            })
            select(table.fetchBy {
                permissions {
                    code()
                }
            })
        }.flatMap {
            it.permissions
        }.map {
            it.code
        }

}