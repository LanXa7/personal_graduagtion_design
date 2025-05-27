package com.example.repository.dict

import com.example.model.entity.dict.DictData
import com.example.model.entity.dict.typeId
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.fetcher.Fetcher
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.babyfish.jimmer.sql.kt.ast.expression.eq
import org.springframework.stereotype.Repository

@Repository
class DictDataRepository(
    sql: KSqlClient
) : AbstractKotlinRepository<DictData, Long>(sql) {

    fun findByTypeId(
        typeId: Long,
        fetcher: Fetcher<DictData>? = null
    ): List<DictData> =
        executeQuery {
            where(table.typeId eq typeId)
            select(table.fetch(fetcher))
        }
}