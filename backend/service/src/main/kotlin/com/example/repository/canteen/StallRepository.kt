package com.example.repository.canteen

import com.example.model.entity.canteen.*
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.fetcher.Fetcher
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.*
import org.springframework.stereotype.Repository

@Repository
class StallRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<Stall, Long>(sql) {

    fun pageByCanteenIdOrderByCreateTimeDesc(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallName: String?,
        fetcher: Fetcher<Stall>? = null
    ) =
        createQuery {
            where(table.canteenId `eq?` canteenId)
            where(table.name `like?` stallName)
            orderBy(table.createTime.desc())
            select(table.fetch(fetcher))
        }.fetchPage(pageIndex, pageSize)

    fun findIdByUserId(userId: Long) =
        createQuery {
            where(table.userId eq userId)
            select(table.id)
        }.fetchOne()

    fun findListByCanteenId(
        canteenId: Long?,
        fetcher: Fetcher<Stall>? = null
    ) =
        executeQuery {
            where(table.canteenId `eq?` canteenId)
            select(table.fetch(fetcher))
        }

    fun findCountByCanteenIds(canteenIds: Collection<Long>) =
        executeQuery {
            where(table.canteenId valueIn canteenIds)
            groupBy(table.canteenId)
            select(table.canteenId, count(table.id))
        }.associateBy({ it._1 }) {
            it._2
        }

    fun findFoodNumberByCanteenId(
        canteenId: Long? = null,
        fetcher: Fetcher<Stall>? = null
    ) =
        executeQuery {
            where(table.canteenId eq canteenId)
            select(table.fetch(fetcher))
        }

    fun findStallNumber(
        canteenId: Long? = null,
    ) =
        createQuery {
            where(table.canteenId `eq?`  canteenId)
            select(count(table.id))
        }.fetchOne()


}