package com.example.service.canteen

import com.example.exception.RequestErrorBodyException
import com.example.ext.withTransaction
import com.example.model.entity.canteen.Stall
import com.example.model.entity.canteen.by
import com.example.model.entity.canteen.dto.StallSaveInput
import com.example.model.enums.Role
import com.example.model.enums.Role.CANTEEN_ADMIN
import com.example.model.enums.Role.SUPER_ADMIN
import com.example.repository.canteen.CanteenRepository
import com.example.repository.canteen.StallRepository
import com.example.utils.MyStpUtils
import org.babyfish.jimmer.Page
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.stereotype.Service

@Service
class StallService(
    private val stallRepository: StallRepository,
    private val canteenRepository: CanteenRepository,
) {

    fun pageStall(
        pageIndex: Int,
        pageSize: Int,
        canteenId: Long?,
        stallName: String?
    ): Page<Stall> {
        val role = MyStpUtils.getCurrentUserRole()
        val lastCanteenId = getCanteenIdByRole(role, canteenId, isQuery = true)
        return pageByCanteenId(pageIndex, pageSize, lastCanteenId, stallName)
    }

    private fun pageByCanteenId(pageIndex: Int, pageSize: Int, canteenId: Long?, stallName: String?) =
        stallRepository.pageByCanteenIdOrderByCreateTimeDesc(pageIndex, pageSize, canteenId, stallName, STALL_FETCHER)

    fun createStall(input: StallSaveInput) {
        val role = MyStpUtils.getCurrentUserRole()
        val canteenId = getCanteenIdByRole(role, input.canteenId)

        saveStall(
            input.toEntity {
                this.canteenId = canteenId!!
            },
            SaveMode.INSERT_ONLY
        )
    }

    fun updateStall(id: Long, input: StallSaveInput) {
        val role = MyStpUtils.getCurrentUserRole()
        val canteenId = getCanteenIdByRole(role, input.canteenId)

        saveStall(
            input.toEntity {
                this.id = id
                this.canteenId = canteenId!!
            },
            SaveMode.UPDATE_ONLY
        )
    }

    private fun getCanteenIdByRole(role: Role, inputCanteenId: Long? = null, isQuery: Boolean = false): Long? {
        return when (role) {
            SUPER_ADMIN -> {
                if (isQuery) {
                    inputCanteenId
                } else {
                    if (inputCanteenId == null) {
                        throw RequestErrorBodyException()
                    }
                    inputCanteenId
                }
            }

            CANTEEN_ADMIN -> canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId())
            else -> TODO()
        }
    }

    private fun saveStall(entity: Stall, saveMode: SaveMode) {
        withTransaction {
            stallRepository.save(entity) {
                setMode(saveMode)
            }
        }
    }

    fun deleteStall(id: Long) {
        withTransaction {
            stallRepository.deleteById(id)
        }
    }

    fun allocationStall(id: Long, userId: Long) {
        withTransaction {
            stallRepository.save(
                Stall {
                    this.id = id
                    this.userId = userId
                }
            ) {
                setMode(SaveMode.UPDATE_ONLY)
            }
        }
    }

    fun listStall(): List<Stall> {
        val role = MyStpUtils.getCurrentUserRole()
        val lastCanteenId = getCanteenIdByRole(role, isQuery = true)
        return stallRepository.findListByCanteenId(lastCanteenId, STALL_LIST_FETCHER)
    }

    fun getStallNumber() =
        when (MyStpUtils.getCurrentUserRole()) {
            SUPER_ADMIN -> stallRepository.findStallNumber()
            CANTEEN_ADMIN -> stallRepository.findStallNumber(canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId()))
            else -> TODO()
        }

    fun listEveryFoodNumber() =
        stallRepository.findAll(STALL_FOOD_NUMBER_FETCHER)


    companion object {
        private val STALL_FETCHER = newFetcher(Stall::class).by {
            allScalarFields()
            canteen {
                name()
            }
            user {
                username()
            }
        }

        private val STALL_LIST_FETCHER = newFetcher(Stall::class).by {
            name()
            canteen {
                name()
            }
        }

        private val STALL_FOOD_NUMBER_FETCHER = newFetcher(Stall::class).by {
            foodNumber()
            name()
        }

    }

}