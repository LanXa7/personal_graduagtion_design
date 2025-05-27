package com.example.repository.canteen

import com.example.model.entity.canteen.*
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.fetcher.Fetcher
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.*
import org.springframework.stereotype.Repository

@Repository
class FoodRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<Food, Long>(sql) {

    fun findByNameAndStallId(
        name: String,
        stallId: Long,
        fetcher: Fetcher<Food>
    ): Food =
        createQuery {
            where(table.name eq name)
            where(table.stallId eq stallId)
            select(table.fetch(fetcher))
        }.fetchOne()

    fun pageFoodOrderByCreateTimeDesc(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallId: Long?,
        foodName: String?,
        fetcher: Fetcher<Food>? = null
    ) =
        createQuery {
            where(table.stall.canteenId `eq?` canteenId)
            where(table.stallId `eq?` stallId)
            where(table.name `like?` foodName)
            orderBy(table.createTime.desc())
            select(table.fetch(fetcher))
        }.fetchPage(pageIndex, pageSize)

    fun listFood(
        canteenId: Long?,
        stallId: Long?,
        fetcher: Fetcher<Food>? = null
    ) =
        executeQuery {
            where(table.stall.canteenId `eq?` canteenId)
            where(table.stallId `eq?` stallId)
            select(table.fetch(fetcher))
        }

    fun findByStallId(
        stallId: Long,
        fetcher: Fetcher<Food>? = null
    ) =
        executeQuery {
            where(table.stallId eq stallId)
            select(table.fetch(fetcher))
        }

    fun getStallFoodNumber(stallIds: Collection<Long>) =
        executeQuery {
            where(table.stallId valueIn stallIds)
            groupBy(table.stallId)
            select(table.stallId, count(table.id))
        }.associateBy({ it._1 }) {
            it._2
        }

    fun findFoodNumber(
        canteenId: Long? = null,
        stallId: Long? = null
    ) =
        createQuery {
            where(table.stall.canteenId `eq?` canteenId)
            where(table.stallId `eq?` stallId)
            select(count(table.id))
        }.fetchOne()

}