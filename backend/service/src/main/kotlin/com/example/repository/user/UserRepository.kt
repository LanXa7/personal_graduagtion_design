package com.example.repository.user


import com.example.exception.UserNotFoundException
import com.example.model.entity.user.*
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.fetcher.Fetcher
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.eq
import org.babyfish.jimmer.sql.kt.ast.expression.`like?`
import org.babyfish.jimmer.sql.kt.ast.expression.ne
import org.babyfish.jimmer.sql.kt.ast.expression.or
import org.springframework.stereotype.Repository

@Repository
class UserRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<User, Long>(sql) {

    fun findUserByText(text: String): User? =
        createQuery {
            where(
                or(
                    table.username eq text,
                    table.phone eq text,
                    table.email eq text
                )
            )
            select(table.fetchBy {
                allScalarFields()
                stall()
            })
        }.fetchOneOrNull()

    fun isUserNameExists(username: String): Boolean =
        createQuery {
            where(table.username eq username)
            select(table.username)
        }.exists()

    fun isEmailExists(email: String): Boolean =
        createQuery {
            where(table.email eq email)
            select(table.email)
        }.exists()

    fun findUserIdByUsername(email: String): Long =
        createQuery {
            where(table.email eq email)
            select(table.id)
        }.fetchOneOrNull() ?: throw UserNotFoundException()

    fun isUserExists(id: Long): Boolean =
        createQuery {
            where(table.id eq id)
            select(table.id)
        }.exists()

    fun pageUserExcludeMe(
        pageIndex: Int,
        pageSize: Int,
        username: String?,
        currentUserId: Long,
        fetcher: Fetcher<User>? = null
    ) =
        createQuery {
            where(table.username `like?` username)
            where(table.id ne currentUserId)
            select(table.fetch(fetcher))
        }.fetchPage(pageIndex, pageSize)

}