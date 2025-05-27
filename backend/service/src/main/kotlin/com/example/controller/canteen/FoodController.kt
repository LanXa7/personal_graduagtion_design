package com.example.controller.canteen

import cn.dev33.satoken.annotation.SaCheckRole
import cn.dev33.satoken.annotation.SaMode
import com.example.model.common.Const
import com.example.model.entity.canteen.Food
import com.example.model.entity.canteen.dto.FoodSaveInput
import com.example.service.canteen.FoodService
import com.example.service.file.ImageService
import jakarta.validation.Valid
import jakarta.validation.constraints.Min
import org.babyfish.jimmer.Page
import org.babyfish.jimmer.client.FetchBy
import org.babyfish.jimmer.client.meta.DefaultFetcherOwner
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.math.BigDecimal

@RestController
@Validated
@DefaultFetcherOwner(value = FoodService::class)
@RequestMapping("/food")
class FoodController(
    private val foodService: FoodService,
    private val imageService: ImageService
) {

    @GetMapping("/list")
    fun listFood(): List<@FetchBy("FOOD_LIST_FETCHER") Food> =
        foodService.listFood()

    /**
     * 餐品数据分页
     */
    @GetMapping("/page")
    fun pageFood(
        @RequestParam(defaultValue = "0") pageIndex: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam canteenId: Long?,
        @RequestParam stallId: Long?,
        @RequestParam foodName: String?
    ): Page<@FetchBy("FOOD_FETCHER") Food> =
        foodService.pageFood(pageIndex, pageSize, canteenId, stallId, foodName)

    @PostMapping
    fun createFood(
        @Valid @RequestBody input: FoodSaveInput
    ) =
        foodService.createFood(input)

    /**
     * 修改食品信息
     */
    @PutMapping("/{id}")
    fun updateFood(
        @PathVariable id: Long,
        @RequestBody input: FoodSaveInput
    ) =
        foodService.updateFood(id, input)

    /**
     * 修改食品价格
     */
    @PatchMapping("/{id}")
    fun updateFoodPrice(
        @PathVariable id: Long,
        @RequestParam @Min(0) price: BigDecimal
    ) =
        foodService.updateFoodPrice(id,price)

    @DeleteMapping("/{id}")
    fun deleteFood(
        @PathVariable id: Long,
    ) =
        foodService.deleteFood(id)

    @PostMapping("/picture")
    fun uploadPicture(
        @RequestPart("file") file: MultipartFile,
        @RequestParam stallId: Long?,
        @RequestParam id: Long?
    ): String =
        imageService.uploadPicture(file, stallId, id)

    /**
     * 获得餐品推荐
     */
    @GetMapping("/recommendation")
    fun recommendation(): Map<String, List<@FetchBy("FOOD_LIST_FETCHER") Food>> =
        foodService.getRecommendation()

    @GetMapping("/number")
    @SaCheckRole(
        value = [Const.SUPER_ADMIN, Const.CANTEEN_ADMIN, Const.STALL_ADMIN],
        mode = SaMode.OR
    )
    fun getFoodNumber(): Long =
        foodService.getFoodNumber()

}