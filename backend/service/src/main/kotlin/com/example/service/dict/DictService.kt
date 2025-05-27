package com.example.service.dict

import com.example.model.entity.dict.DictData
import com.example.model.entity.dict.DictType
import com.example.model.entity.dict.by
import com.example.model.entity.dict.dto.DictView
import com.example.repository.dict.DictDataRepository
import com.example.repository.dict.DictTypeRepository
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.stereotype.Service

@Service
class DictService(
    private val dictTypeRepository: DictTypeRepository,
    private val dictDataRepository: DictDataRepository
) {

    fun queryDict() =
        dictDataRepository.findAll(DICT_ALL_FETCHER).map {
            DictView(it)
        }

    fun queryTypes() =
        dictTypeRepository.findAll(DICT_TYPE_ALL_FETCHER)

    fun queryDataBy(typeId: Long) =
        dictDataRepository.findByTypeId(typeId, DICT_DATA_ALL_BY_TYPE_FETCHER)

    companion object {
        private val DICT_ALL_FETCHER = newFetcher(DictData::class).by {
            label()
            value()
            type {
                code()
            }
        }
        private val DICT_DATA_ALL_BY_TYPE_FETCHER = newFetcher(DictData::class).by {
            label()
            value()
        }
        private val DICT_TYPE_ALL_FETCHER = newFetcher(DictType::class).by {
            code()
        }
    }

}