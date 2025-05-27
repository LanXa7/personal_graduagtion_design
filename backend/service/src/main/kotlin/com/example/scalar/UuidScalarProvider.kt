package com.example.scalar

import org.babyfish.jimmer.sql.runtime.ScalarProvider
import org.postgresql.util.PGobject
import org.springframework.stereotype.Component
import java.util.*

@Component
class UuidScalarProvider: ScalarProvider<UUID, PGobject> {

    override fun toScalar(sqlValue: PGobject): UUID {
        // 验证类型是否为uuid
        require(sqlValue.type == "uuid") {
            "Expected PGobject of type 'uuid', but got '${sqlValue.type}'"
        }

        return UUID.fromString(sqlValue.value)
    }

    override fun toSql(scalarValue: UUID): PGobject =
        PGobject().apply {
            this.type = "uuid"
            this.value = scalarValue.toString()
        }
}