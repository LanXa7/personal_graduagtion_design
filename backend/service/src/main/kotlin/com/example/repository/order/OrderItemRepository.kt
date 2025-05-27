package com.example.repository.order

import com.example.model.entity.order.OrderItem
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.springframework.stereotype.Repository

@Repository
class OrderItemRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<OrderItem, Long>(sql) {
}