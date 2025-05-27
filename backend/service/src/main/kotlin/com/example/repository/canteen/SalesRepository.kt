package com.example.repository.canteen

import com.example.model.entity.canteen.*
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.fetcher.Fetcher
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.*
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class SalesRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<Sales, Long>(sql) {

    fun findTodayInfoByStallIdAndFoodId(
        stallId: Long,
        foodId: Long,
        todayStart: LocalDateTime,
        tomorrowStart: LocalDateTime,
        fetcher: Fetcher<Sales>? = null
    ) =
        createQuery {
            where(table.stallId eq stallId)
            where(table.foodId eq foodId)
            // 筛选今天的销量
            where(table.createTime lt tomorrowStart)
            where(table.createTime gt todayStart)
            select(table.fetch(fetcher))
        }.fetchOneOrNull()

    fun findYesterdayFoodMapByStallId(
        stallId: Long,
        todayStart: LocalDateTime,
        yesterdayStart: LocalDateTime
    ) =
        executeQuery {
            where(table.stallId eq stallId)
            // 筛选前一天的销量
            where(table.createTime lt todayStart)
            where(table.createTime gt yesterdayStart)
            orderBy(table.number.desc())
            select(table.fetchBy {
                number()
                food {
                    name()
                }
            })
        }.map {
            it.food.name to it.number
        }

    fun findFoodSalesByStallId(
        stallId: Long,
        startTime: LocalDateTime? = null,
        endTime: LocalDateTime? = null,
    ) =
        executeQuery {
            where(table.stallId eq stallId)
            where(table.createTime `ge?` startTime)
            where(table.createTime `le?` endTime)
            groupBy(table.foodId)
            select(table.foodId, sum(table.number).asNonNull())
        }.associateBy({ it._1 }) {
            it._2
        }

    fun findHistorySalesByStallId(
        stallId: Long,
        startTime: LocalDateTime?,
        endTime: LocalDateTime?,
        fetcher: Fetcher<Sales>? = null
    ) =
        executeQuery {
            where(table.stallId eq stallId)
            where(table.createTime `ge?` startTime)
            where(table.createTime `le?` endTime)
            select(table.fetch(fetcher))
        }

    fun findStallSales(
        startTime: LocalDateTime? = null,
        endTime: LocalDateTime? = null,
    ) =
        executeQuery {
            where(table.createTime `ge?` startTime)
            where(table.createTime `le?` endTime)
            groupBy(table.stallId)
            select(table.stallId, sum(table.number).asNonNull())
        }.associateBy({ it._1 }) {
            it._2
        }

    fun findCanteenHistorySalesByStallId(
        canteenId: Long,
        startTime: LocalDateTime?,
        endTime: LocalDateTime?
    ) =
        executeQuery {
            where(table.stall.canteenId eq canteenId)
            where(table.createTime `ge?` startTime)
            where(table.createTime `le?` endTime)
            select(table.createTime, table.number)
        }.groupBy { it._1.toLocalDate() }
            .mapValues { (_, records) ->
                records.sumOf { it._2 }
            }

    fun findCanteenSales(
        startTime: LocalDateTime? = null,
        endTime: LocalDateTime? = null
    ) =
        executeQuery {
            where(table.createTime `ge?` startTime)
            where(table.createTime `le?` endTime)
            groupBy(table.stall.canteenId)
            select(table.stall.canteenId, sum(table.number).asNonNull())
        }.associateBy({ it._1 }) {
            it._2
        }

}