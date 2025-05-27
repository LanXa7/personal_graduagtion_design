package com.example.resolver

import com.example.repository.canteen.StallRepository
import org.babyfish.jimmer.sql.kt.KTransientResolver
import org.springframework.stereotype.Component

@Component
class CanteenStallNumberResolver(
    private val stallRepository: StallRepository
) : KTransientResolver<Long, Long>{

    override fun resolve(ids: Collection<Long>): Map<Long, Long> =
        stallRepository.findCountByCanteenIds(ids)

    override fun getDefaultValue(): Long = 0L
}