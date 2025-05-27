package com.example.controller.canteen

import cn.dev33.satoken.annotation.SaCheckRole
import cn.dev33.satoken.annotation.SaMode
import com.example.model.common.Const
import com.example.model.entity.canteen.Stall
import com.example.model.entity.canteen.dto.StallSaveInput
import com.example.service.canteen.StallService
import jakarta.validation.Valid
import org.babyfish.jimmer.Page
import org.babyfish.jimmer.client.FetchBy
import org.babyfish.jimmer.client.meta.DefaultFetcherOwner
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@Validated
@RequestMapping("/stall")
@DefaultFetcherOwner(value = StallService::class)
class StallController(
    private val stallService: StallService
) {

    @GetMapping("/page")
    @SaCheckRole(value = [Const.SUPER_ADMIN, Const.CANTEEN_ADMIN], mode = SaMode.OR)
    fun pageStall(
        @RequestParam(defaultValue = "0") pageIndex: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam canteenId: Long?,
        @RequestParam stallName: String?
    ): Page<@FetchBy("STALL_FETCHER") Stall> =
        stallService.pageStall(pageIndex, pageSize, canteenId, stallName)

    @GetMapping("/list")
    fun listStall(): List<@FetchBy(value = "STALL_LIST_FETCHER") Stall> =
        stallService.listStall()

    /**
     * 新增摊位
     */
    @PostMapping
    @SaCheckRole(value = [Const.SUPER_ADMIN, Const.CANTEEN_ADMIN], mode = SaMode.OR)
    fun createStall(
        @RequestBody @Valid input: StallSaveInput
    ) =
        stallService.createStall(input)

    /**
     * 更新摊位
     */
    @PutMapping("/{id}")
    @SaCheckRole(value = [Const.SUPER_ADMIN, Const.CANTEEN_ADMIN], mode = SaMode.OR)
    fun updateStall(
        @PathVariable id: Long,
        @RequestBody @Valid input: StallSaveInput
    ) =
        stallService.updateStall(id, input)

    /**
     * 删除摊位
     */
    @DeleteMapping("/{id}")
    @SaCheckRole(value = [Const.SUPER_ADMIN, Const.CANTEEN_ADMIN], mode = SaMode.OR)
    fun deleteStall(
        @PathVariable id: Long,
    ) =
        stallService.deleteStall(id)

    @PatchMapping("/{id}/user/{userId}")
    @SaCheckRole(value = [Const.SUPER_ADMIN, Const.CANTEEN_ADMIN], mode = SaMode.OR)
    fun allocationCanteen(
        @PathVariable id: Long,
        @PathVariable userId: Long,
    ) =
        stallService.allocationStall(id, userId)

    /**
     * 超级管理员和食堂管理员用
     * 获取摊位总数
     */
    @GetMapping("/number")
    @SaCheckRole(
        value = [Const.SUPER_ADMIN, Const.CANTEEN_ADMIN],
        mode = SaMode.OR
    )
    fun getStallNumber(): Long =
        stallService.getStallNumber()

    /**
     * 食堂管理员用
     * 获取每个摊位食品数量 前端可以求和获得总的摊位食品数量
     */
    @GetMapping("/every/food_number")
    @SaCheckRole(value = [Const.CANTEEN_ADMIN])
    fun listEveryFoodNumber(): List<@FetchBy("STALL_FOOD_NUMBER_FETCHER") Stall> =
        stallService.listEveryFoodNumber()


}