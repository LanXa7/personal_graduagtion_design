package com.example.resolver

import com.example.repository.canteen.FoodRepository
import org.babyfish.jimmer.sql.kt.KTransientResolver
import org.springframework.stereotype.Component

@Component
class StallFoodNumberResolver(
    private val foodRepository: FoodRepository
) : KTransientResolver<Long, Long> {

    override fun resolve(ids: Collection<Long>): Map<Long, Long> =
        foodRepository.getStallFoodNumber(ids)

    override fun getDefaultValue(): Long = 0L
}