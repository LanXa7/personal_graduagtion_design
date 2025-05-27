package com.example.service.user

import cn.dev33.satoken.stp.StpUtil
import cn.hutool.crypto.digest.BCrypt
import com.example.exception.*
import com.example.ext.withTransaction
import com.example.model.entity.user.User
import com.example.model.entity.user.addBy
import com.example.model.entity.user.dto.UserLoginInput
import com.example.model.entity.user.dto.UserLoginView
import com.example.model.entity.user.dto.UserRegisterInput
import com.example.model.entity.user.dto.UserResetPasswordInput
import com.example.model.enums.EmailType
import com.example.model.enums.Role
import com.example.repository.user.UserRepository
import com.example.utils.EmailUtils
import com.example.utils.JwtUtils
import com.example.utils.MyStpUtils
import com.example.utils.RedissonUtils
import org.babyfish.jimmer.sql.ast.mutation.SaveMode
import org.springframework.stereotype.Service

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val jwtUtils: JwtUtils,
    private val redissonUtils: RedissonUtils,
    private val emailUtils: EmailUtils,
) {

    fun signIn(input: UserLoginInput): UserLoginView {
        val user = userRepository.findUserByText(input.text) ?: throw UserNotFoundException()
        if (!BCrypt.checkpw(input.password, user.password)) {
            throw UsernameOrPasswordException()
        }
        MyStpUtils.loginAndSetStallId(user.id, user.stall?.id)
        return UserLoginView(
            user,
            StpUtil.getTokenValue(),
            StpUtil.getTokenTimeout(),
            StpUtil.getRoleList(),
            StpUtil.getPermissionList()
        )
    }

    fun queryEmailVerifyCode(
        email: String,
        type: EmailType,
        address: String
    ) {
        if (userRepository.isEmailExists(email) && type != EmailType.RESET) {
            throw UsernameOrEmailAlreadyExistsException()
        }
        emailUtils.getVerifyCode(email, type, address)
    }


    fun signUp(input: UserRegisterInput) {
        if (
            userRepository.isUserNameExists(input.username) ||
            userRepository.isEmailExists(input.email)
        ) {
            throw UsernameOrEmailAlreadyExistsException()
        }
        val code = redissonUtils.auth.getEmailVerifyCode(input.email)
            ?: throw CodeIsNotExistsException()
        if (input.code != code) {
            throw CodeIsNotTrueException()
        }
        val entity = input.toEntity {
            this.password = BCrypt.hashpw(input.password)
            this.roles().addBy {
                this.code = Role.NORMAL
            }
        }
        withTransaction {
            userRepository.save(entity) {
                setMode(SaveMode.INSERT_ONLY)
            }
        }
        redissonUtils.auth.deleteEmailVerifyCode(input.email)
    }

    fun logout() {
        if (jwtUtils.invalidateJwt(StpUtil.getTokenValue())) {
            StpUtil.logout()
        }
    }

    fun resetPasswordConfirm(email: String, code: String) {
        val confirmCode = redissonUtils.auth.getEmailVerifyCode(email)
            ?: throw CodeIsNotExistsException()
        if (code != confirmCode) {
            throw CodeIsNotTrueException()
        }
    }

    fun resetPassword(input: UserResetPasswordInput) {
        resetPasswordConfirm(input.email, input.code)
        val userId = userRepository.findUserIdByUsername(input.email)
        withTransaction {
            userRepository.save(
                User {
                    this.id = userId
                    this.password = BCrypt.hashpw(input.password)
                }
            )
        }
        redissonUtils.auth.deleteEmailVerifyCode(input.email)
    }

}