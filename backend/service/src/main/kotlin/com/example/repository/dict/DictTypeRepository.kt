package com.example.repository.dict

import com.example.model.entity.dict.DictType
import org.babyfish.jimmer.spring.repo.support.AbstractKotlinRepository
import org.babyfish.jimmer.sql.kt.KSqlClient
import org.springframework.stereotype.Repository

@Repository
class DictTypeRepository(
    sql:KSqlClient
) : AbstractKotlinRepository<DictType, Long>(sql) {

}