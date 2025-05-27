package com.example.repository.order

import com.example.model.entity.canteen.canteenId
import com.example.model.entity.order.*
import com.example.model.enums.order.OrderState
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.fetcher.Fetcher
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.*
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
class OrderRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<Order, Long>(sql) {

    fun pageOrderOrderByCreateTimeDesc(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallId: Long?,
        startTime: LocalDateTime?,
        endTime: LocalDateTime?,
        orderState: OrderState?,
        fetcher: Fetcher<Order>? = null
    ) =
        createQuery {
            where(table.stall.canteenId `eq?` canteenId)
            where(table.stallId `eq?` stallId)
            where(table.createTime `ge?` startTime)
            where(table.createTime `le?` endTime)
            where(table.state `eq?` orderState)
            orderBy(table.createTime.desc())
            select(table.fetch(fetcher))
        }.fetchPage(pageIndex, pageSize)

    fun findByCode(
        code: String,
        fetcher: Fetcher<Order>? = null
    ) =
        createQuery {
            where(table.code eq code)
            select(table.fetch(fetcher))
        }.fetchOne()
}