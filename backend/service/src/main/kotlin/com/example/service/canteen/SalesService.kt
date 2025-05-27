package com.example.service.canteen

import com.example.exception.FoodIsNotFoundException
import com.example.exception.StallNotFoundException
import com.example.http.response.CanteenSalesResponse
import com.example.http.response.CanteenStallSalesResponse
import com.example.http.response.StallFoodSalesResponse
import com.example.model.entity.canteen.Sales
import com.example.model.entity.canteen.by
import com.example.model.entity.canteen.dto.SalesHistoryView
import com.example.repository.canteen.CanteenRepository
import com.example.repository.canteen.FoodRepository
import com.example.repository.canteen.SalesRepository
import com.example.repository.canteen.StallRepository
import com.example.utils.MyStpUtils
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.stereotype.Service
import java.time.LocalDate

@Service
class SalesService(
    private val salesRepository: SalesRepository,
    private val foodRepository: FoodRepository,
    private val stallRepository: StallRepository,
    private val canteenRepository: CanteenRepository
) {

    fun listStallFoodRanking() =
        salesRepository
            .findFoodSalesByStallId(MyStpUtils.getCurrentStallId())
            .toList()
            .sortedByDescending { (_, v) -> v }
            .take(SIZE)
            .toMap()
            .toStallFoodSalesResponse()


    fun listStallHistorySales(
        startDay: LocalDate?,
        endDay: LocalDate?
    ): List<SalesHistoryView> {
        val startTime = startDay?.atStartOfDay()
        val endTime = endDay?.plusDays(1)?.atStartOfDay()
        return salesRepository.findHistorySalesByStallId(
            MyStpUtils.getCurrentStallId(),
            startTime,
            endTime,
            SALES_VOLUME_HISTORY_FETCHER
        ).map {
            SalesHistoryView(it, it.createTime.toLocalDate())
        }
    }

    fun listEveryFoodYesterdaySales(): List<StallFoodSalesResponse> {
        val today = LocalDate.now()
        val startTime = today.minusDays(1).atStartOfDay()
        val endTime = today.atStartOfDay()

        return salesRepository
            .findFoodSalesByStallId(
                MyStpUtils.getCurrentStallId(),
                startTime,
                endTime
            ).toStallFoodSalesResponse()
    }

    private fun Map<Long, Int>.toStallFoodSalesResponse(): List<StallFoodSalesResponse> {
        val foods = foodRepository.findByIds(keys).associateBy { it.id }
        return map { (foodId, sales) ->
            StallFoodSalesResponse(
                foods[foodId]?.name ?: throw FoodIsNotFoundException(),
                sales
            )
        }
    }

    fun listCanteenStallRanking(): List<CanteenStallSalesResponse> =
        salesRepository
            .findStallSales()
            .toList()
            .sortedByDescending { (_, v) -> v }
            .take(SIZE)
            .toMap()
            .toCanteenStallSalesResponse()


    fun listCanteenHistorySales(
        startDay: LocalDate?,
        endDay: LocalDate?
    ): List<SalesHistoryView> {
        val startTime = startDay?.atStartOfDay()
        val endTime = endDay?.plusDays(1)?.atStartOfDay()
        return salesRepository.findCanteenHistorySalesByStallId(
            canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId()),
            startTime,
            endTime,
        ).map {
            SalesHistoryView(it.value, it.key)
        }
    }

    fun listEveryStallYesterdaySales(): List<CanteenStallSalesResponse> {
        val today = LocalDate.now()
        val startTime = today.minusDays(1).atStartOfDay()
        val endTime = today.atStartOfDay()

        return salesRepository
            .findStallSales(
                startTime,
                endTime
            ).toCanteenStallSalesResponse()
    }

    private fun Map<Long, Int>.toCanteenStallSalesResponse(): List<CanteenStallSalesResponse> {
        val stalls = stallRepository.findByIds(keys).associateBy { it.id }
        return map { (stallId, sales) ->
            CanteenStallSalesResponse(
                stalls[stallId]?.name ?: throw StallNotFoundException(),
                sales
            )
        }
    }

    fun listCanteenRanking() =
        salesRepository
            .findCanteenSales()
            .toList()
            .sortedByDescending { (_, v) -> v }
            .take(SIZE)
            .toMap()
            .toCanteenSalesResponse()

    fun listEveryCanteenYesterdaySales(): List<CanteenSalesResponse> {
        val today = LocalDate.now()
        val startTime = today.minusDays(1).atStartOfDay()
        val endTime = today.atStartOfDay()

        return salesRepository
            .findCanteenSales(
                startTime,
                endTime
            ).toCanteenSalesResponse()
    }

    private fun Map<Long, Int>.toCanteenSalesResponse(): List<CanteenSalesResponse> {
        val canteens = canteenRepository.findByIds(keys).associateBy { it.id }
        return map { (canteenId, sales) ->
            CanteenSalesResponse(
                canteens[canteenId]?.name ?: throw StallNotFoundException(),
                sales
            )
        }
    }

    companion object {
        private const val SIZE = 5
        private val SALES_VOLUME_HISTORY_FETCHER = newFetcher(Sales::class).by {
            number()
            createTime()
        }
    }

}