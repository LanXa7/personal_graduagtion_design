package com.example.service.canteen

import com.example.exception.CanteenNameIsAlreadyInUsed
import com.example.ext.withTransaction
import com.example.model.entity.canteen.Canteen
import com.example.model.entity.canteen.Stall
import com.example.model.entity.canteen.by
import com.example.model.entity.canteen.dto.CanteenSaveInput
import com.example.repository.canteen.CanteenRepository
import com.example.repository.canteen.StallRepository
import com.example.repository.user.UserRepository
import com.example.utils.MyStpUtils
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.stereotype.Service

@Service
class CanteenService(
    private val canteenRepository: CanteenRepository,
    private val userRepository: UserRepository,
    private val stallRepository: StallRepository,
) {

    /**
     * 获取全部食堂信息
     */
    fun pageCanteen(
        pageIndex: Int,
        pageSize: Int,
        canteenName: String?
    ) =
        canteenRepository.pageLikeCanteenNameOrderByCreateTimeDesc(pageIndex, pageSize, canteenName, CANTEEN_FETCHER)

    /**
     * 新增食堂
     */
    fun createCanteen(input: CanteenSaveInput) {
        isNameAlreadyInUsed(name = input.name)
        saveCanteen(
            input.toEntity {

            }, SaveMode.INSERT_ONLY
        )
    }

    fun updateCanteen(id: Long, input: CanteenSaveInput) {
        isNameAlreadyInUsed(id, input.name)
        saveCanteen(
            input.toEntity {
                this.id = id
            }, SaveMode.UPDATE_ONLY
        )
    }

    private fun saveCanteen(entity: Canteen, saveMode: SaveMode) {
        withTransaction {
            canteenRepository.save(entity) {
                setMode(saveMode)
            }
        }
    }

    private fun isNameAlreadyInUsed(id: Long? = null, name: String) {
        if (canteenRepository.isExistsByName(id, name)) {
            throw CanteenNameIsAlreadyInUsed()
        }
    }

    fun allocationCanteen(id: Long, userId: Long) {
        withTransaction {
            canteenRepository.save(
                Canteen {
                    this.id = id
                    this.userId = userId
                }
            ) {
                setMode(SaveMode.UPDATE_ONLY)
            }
        }
    }

    fun deleteCanteen(id: Long) {
        withTransaction {
            canteenRepository.deleteById(id)
        }
    }

    fun listCanteen() =
        canteenRepository.findAll(CANTEEN_LIST_FETCHER)


    fun listEveryStallNumber() =
        canteenRepository.findAll(CANTEEN_STALL_NUMBER_FETCHER)

    fun listEveryStallFoodNumber() =
        stallRepository.findFoodNumberByCanteenId(
            canteenRepository.findIdByUserId(MyStpUtils.getCurrentUserId()),
            STALL_FOOD_NUMBER_FETCHER
        )

    fun getCanteenNumber() =
        canteenRepository.findCanteenNumber()

    companion object {
        private val CANTEEN_FETCHER = newFetcher(Canteen::class).by {
            name()
            directorName()
            directorPhone()
            address()
            createTime()
            user {
                username()
            }
        }

        private val CANTEEN_LIST_FETCHER = newFetcher(Canteen::class).by {
            name()
        }

        private val CANTEEN_STALL_NUMBER_FETCHER = newFetcher(Canteen::class).by {
            name()
            stallNumber()
        }

        private val STALL_FOOD_NUMBER_FETCHER = newFetcher(Stall::class).by {
            name()
            foodNumber()
        }
    }

}