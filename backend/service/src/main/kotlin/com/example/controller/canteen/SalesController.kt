package com.example.controller.canteen

import cn.dev33.satoken.annotation.SaCheckRole
import com.example.http.response.CanteenSalesResponse
import com.example.http.response.CanteenStallSalesResponse
import com.example.http.response.StallFoodSalesResponse
import com.example.model.common.Const
import com.example.model.entity.canteen.dto.SalesHistoryView
import com.example.service.canteen.SalesService
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.time.LocalDate

@RestController
@RequestMapping("/sales")
class SalesController(
    private val salesService: SalesService
) {

    /**
     * 摊位管理员用
     * 获取摊位的食物销售排名前五名
     */
    @SaCheckRole(value = [Const.STALL_ADMIN])
    @GetMapping("/list/stall/food/ranking")
    fun listStallFoodRanking(): List<StallFoodSalesResponse> =
        salesService.listStallFoodRanking()

    /**
     * 摊位管理员用
     * 获取摊位的历史销量
     */
    @SaCheckRole(value = [Const.STALL_ADMIN])
    @GetMapping("/list/stall/history")
    fun listStallHistorySales(
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") startDay: LocalDate,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") endDay: LocalDate?,
    ): List<SalesHistoryView> =
        salesService.listStallHistorySales(startDay, endDay)

    /**
     * 摊位管理员用
     * 获取摊位的每个餐品的昨日销量
     */
    @SaCheckRole(value = [Const.STALL_ADMIN])
    @GetMapping("/list/stall/food/yesterday")
    fun listEveryFoodYesterdaySales(): List<StallFoodSalesResponse> =
        salesService.listEveryFoodYesterdaySales()

    /**
     * 食堂管理员用
     * 获取食堂的摊位销售排名前五名
     */
    @GetMapping("/list/canteen/stall/ranking")
    @SaCheckRole(value = [Const.CANTEEN_ADMIN])
    fun listCanteenStallRanking(): List<CanteenStallSalesResponse> =
        salesService.listCanteenStallRanking()

    /**
     * 食堂管理员用
     * 获取食堂的历史销量
     */
    @GetMapping("/list/canteen/stall/history")
    @SaCheckRole(value = [Const.CANTEEN_ADMIN])
    fun listCanteenHistorySales(
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") startDay: LocalDate,
        @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") endDay: LocalDate?,
    ): List<SalesHistoryView> =
        salesService.listCanteenHistorySales(startDay, endDay)

    /**
     * 食堂管理员用
     * 获得食堂的每个摊位的昨天的销量
     */
    @GetMapping("/list/canteen/stall/yesterday")
    @SaCheckRole(value = [Const.CANTEEN_ADMIN])
    fun listEveryStallYesterdaySales(): List<CanteenStallSalesResponse> =
        salesService.listEveryStallYesterdaySales()

    /**
     * 超级管理员用
     * 获得全部食堂销量排名前五
     */
    @GetMapping("/list/canteen/ranking")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun listCanteenRanking(): List<CanteenSalesResponse> =
        salesService.listCanteenRanking()

    /**
     * 超级管理员
     * 获得每个食堂的昨日销量
     */
    @GetMapping("/list/canteen/yesterday")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun listEveryCanteenYesterdaySales(): List<CanteenSalesResponse> =
        salesService.listEveryCanteenYesterdaySales()

}