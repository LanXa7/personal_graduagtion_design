package com.example.controller.canteen

import cn.dev33.satoken.annotation.SaCheckRole
import com.example.model.common.Const
import com.example.model.entity.canteen.Canteen
import com.example.model.entity.canteen.Stall
import com.example.model.entity.canteen.dto.CanteenSaveInput
import com.example.service.canteen.CanteenService
import jakarta.validation.Valid
import org.babyfish.jimmer.Page
import org.babyfish.jimmer.client.FetchBy
import org.babyfish.jimmer.client.meta.DefaultFetcherOwner
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@Validated
@RequestMapping("/canteen")
@DefaultFetcherOwner(value = CanteenService::class)
class CanteenController(
    private val canteenService: CanteenService
) {

    /**
     * 获取食堂分页
     */
    @GetMapping("/page")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun pageCanteen(
        @RequestParam(defaultValue = "0") pageIndex: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam canteenName: String?
    ): Page<@FetchBy(value = "CANTEEN_FETCHER") Canteen> =
        canteenService.pageCanteen(pageIndex, pageSize, canteenName)

    /**
     * 获得食堂列表
     */
    @GetMapping("/list")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun listCanteen(): List<@FetchBy(value = "CANTEEN_LIST_FETCHER") Canteen> =
        canteenService.listCanteen()

    /**
     * 新增食堂
     */
    @PostMapping
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun createCanteen(
        @RequestBody @Valid input: CanteenSaveInput
    ) =
        canteenService.createCanteen(input)


    /**
     * 修改食堂
     */
    @PutMapping("/{id}")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun updateCanteen(
        @PathVariable id: Long,
        @RequestBody @Valid input: CanteenSaveInput
    ) =
        canteenService.updateCanteen(id, input)

    /**
     * 删除食堂
     */
    @DeleteMapping("/{id}")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun deleteCanteen(
        @PathVariable id: Long
    ) =
        canteenService.deleteCanteen(id)

    /**
     * 给食堂分配管理员
     */
    @PatchMapping("/{id}/user/{userId}")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun allocationCanteen(
        @PathVariable id: Long,
        @PathVariable userId: Long,
    ) =
        canteenService.allocationCanteen(id, userId)

    /**
     * 超级管理员用
     * 获取食堂总数
     */
    @GetMapping("/number")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun getCanteenNumber(): Long =
        canteenService.getCanteenNumber()

    /**
     * 超级管理员用
     * 获取每个食堂摊位数量 前端可以求和获得总的食堂摊位数量
     */
    @GetMapping("/every/stall_number")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun listEveryStallNumber(): List<@FetchBy("CANTEEN_STALL_NUMBER_FETCHER") Canteen> =
        canteenService.listEveryStallNumber()

    /**
     * 食堂管理员用
     * 获得每个摊位的餐品数量 前端可以求和获得该食堂总的餐品数量
     */
    @SaCheckRole(value = [Const.CANTEEN_ADMIN])
    @GetMapping("/every_stall/food/number")
    fun listEveryStallFoodCount(): List<@FetchBy("STALL_FOOD_NUMBER_FETCHER") Stall> =
        canteenService.listEveryStallFoodNumber()
}