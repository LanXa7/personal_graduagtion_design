package com.example.controller.dict

import com.example.model.entity.dict.DictData
import com.example.model.entity.dict.DictType
import com.example.service.dict.DictService
import org.babyfish.jimmer.client.FetchBy
import org.babyfish.jimmer.client.meta.DefaultFetcherOwner
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/dict")
@DefaultFetcherOwner(value = DictService::class)
class DictController(
    private val dictService: DictService,
) {

    @GetMapping
    fun queryDict() =
        dictService.queryDict()

    @GetMapping("/type")
    fun queryDictTypes(): List<@FetchBy(value = "DICT_TYPE_ALL_FETCHER") DictType> =
        dictService.queryTypes()

    @GetMapping("/{typeId}")
    fun queryDataByTypeId(
        @PathVariable typeId: Long,
    ): List<@FetchBy(value = "DICT_DATA_ALL_BY_TYPE_FETCHER") DictData> =
        dictService.queryDataBy(typeId)

}