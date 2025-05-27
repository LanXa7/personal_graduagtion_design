package com.example.repository.canteen

import com.example.model.entity.canteen.*
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.fetcher.Fetcher
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.*
import org.springframework.stereotype.Repository

@Repository
class CanteenRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<Canteen, Long>(sql) {

    fun isExistsByName(id: Long?, name: String): Boolean =
        createQuery {
            where(table.id `ne?` id)
            where(table.name eq name)
            select(table.id)
        }.exists()

    fun pageLikeCanteenNameOrderByCreateTimeDesc(
        pageIndex: Int,
        pageSize: Int,
        canteenName: String?,
        fetcher: Fetcher<Canteen>? = null
    ) =
        createQuery {
            where(table.name `like?` canteenName)
            orderBy(table.createTime.desc())
            select(table.fetch(fetcher))
        }.fetchPage(pageIndex, pageSize)


    fun findIdByUserId(userId: Long) =
        createQuery {
            where(table.userId eq userId)
            select(table.id)
        }.fetchOne()

    fun findStallNumberByUserId(userId: Long) =
        createQuery {
            where(table.userId eq userId)
            select(table.fetchBy {
                stallNumber()
            })
        }.fetchOne().stallNumber

    fun findCanteenNumber() =
        createQuery {
            select(count(table.id))
        }.fetchOne()
}