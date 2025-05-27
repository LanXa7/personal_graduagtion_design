package com.example.service.user

import cn.dev33.satoken.stp.StpUtil
import cn.hutool.crypto.digest.BCrypt
import cn.idev.excel.FastExcel
import com.example.exception.*
import com.example.ext.withTransaction
import com.example.http.request.UserImportRequest
import com.example.listener.UserImportListener
import com.example.model.entity.user.User
import com.example.model.entity.user.by
import com.example.model.entity.user.dto.*
import com.example.repository.user.UserRepository
import com.example.utils.MyStpUtils
import com.example.utils.RedissonUtils
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.babyfish.jimmer.sql.kt.fetcher.newFetcher
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile

@Service
class UserService(
    private val userRepository: UserRepository,
    private val redissonUtils: RedissonUtils
) {

    fun updateEmail(userId: Long, input: UserUpdateEmailInput) {
        if (userRepository.isEmailExists(input.email)) {
            throw UsernameOrEmailAlreadyExistsException()
        }
        val code = redissonUtils.auth.getEmailVerifyCode(input.email)
            ?: throw CodeIsNotExistsException()
        if (input.code != code) {
            throw CodeIsNotTrueException()
        }
        redissonUtils.auth.deleteEmailVerifyCode(input.email)
        withTransaction {
            userRepository.save(
                User {
                    this.id = userId
                    this.email = input.email
                }
            ) {
                setMode(SaveMode.UPDATE_ONLY)
            }
        }
    }

    fun updatePassword(userId: Long, input: UserUpdatePasswordInput) {
        val oldPassword = userRepository.findById(userId, USER_PASSWORD_FETCHER)?.password
        if (!BCrypt.checkpw(input.oldPassword, oldPassword)) {
            throw OldPasswordException()
        }
        withTransaction {
            userRepository.save(
                User {
                    this.id = userId
                    this.password = BCrypt.hashpw(input.newPassword)
                }
            ) {
                setMode(SaveMode.UPDATE_ONLY)
            }
        }
    }

    fun queryUserInfoBy(id: Long): UserInfoView {
        val user = userRepository.findById(id, USER_INFO_FETCHER)
            ?: throw UserNotFoundException()
        return UserInfoView(user, roles = StpUtil.getRoleList())
    }

    fun pageUser(
        pageIndex: Int,
        pageSize: Int,
        username: String?
    ) =
        userRepository.pageUserExcludeMe(
            pageIndex,
            pageSize,
            username,
            MyStpUtils.getCurrentUserId(),
            USER_PAGE_FETCHER
        )


    fun updateUserRole(input: UserUpdateRoleInput) =
        userRepository.save(input) {
            setMode(SaveMode.UPDATE_ONLY)
        }

    fun importUser(file: MultipartFile) {
        FastExcel.read(
            file.inputStream,
            UserImportRequest::class.java,
            UserImportListener(userRepository)
        ).sheet().doRead()
    }

    fun deleteUser(id: Long) {
        withTransaction {
            userRepository.deleteById(id)
        }
    }

    fun resetUserPassword(userId: Long, input: UserAdminResetPasswordInput) {
        withTransaction {
            userRepository.save(input.toEntity {
                this.id = userId
                this.password = BCrypt.hashpw(input.password)
            }, SaveMode.UPDATE_ONLY)
        }
    }

    companion object {
        private val USER_PASSWORD_FETCHER = newFetcher(User::class).by {
            password()
        }
        private val USER_INFO_FETCHER = newFetcher(User::class).by {
            username()
            phone()
            email()
            avatar()
            createTime()
        }
        private val USER_PAGE_FETCHER = newFetcher(User::class).by {
            username()
            email()
            phone()
            createTime()
            avatar()
            roles {
                code()
            }
        }
    }
}