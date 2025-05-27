package com.example.controller.user

import com.example.http.request.EmailCodeRequest
import com.example.model.entity.user.dto.UserLoginInput
import com.example.model.entity.user.dto.UserLoginView
import com.example.model.entity.user.dto.UserRegisterInput
import com.example.model.entity.user.dto.UserResetPasswordInput
import com.example.service.user.AuthService
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import jakarta.validation.constraints.Email
import org.hibernate.validator.constraints.Length
import org.springframework.validation.annotation.Validated
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/auth")
@Validated
class AuthController(
    private val authService: AuthService,
) {

    /**
     * 登录
     */
    @PostMapping("/sign_in")
    fun signIn(@RequestBody @Valid input: UserLoginInput): UserLoginView =
        authService.signIn(input)

    /**
     * 获取验证码
     */
    @PostMapping("/code")
    fun queryCode(
        @RequestBody @Valid req: EmailCodeRequest,
        httpReq: HttpServletRequest
    ) =
        authService.queryEmailVerifyCode(req.email, req.type, httpReq.remoteAddr)

    /**
     * 注册
     */
    @PostMapping("/sign_up")
    fun signUp(
        @RequestBody @Valid input: UserRegisterInput
    ) =
        authService.signUp(input)

    /**
     * 退出
     */
    @GetMapping("/logout")
    fun logout() =
        authService.logout()

    /**
     * 验证重置验证码是否正确
     */
    @GetMapping("/confirm")
    fun confirm(
        @RequestParam @Email email: String,
        @RequestParam @Length(min = 6, max = 6) code: String
    ) =
        authService.resetPasswordConfirm(email, code)

    /**
     * 重置密码
     */
    @PutMapping("/password")
    fun resetPassword(
        @RequestBody @Valid input: UserResetPasswordInput
    ) =
        authService.resetPassword(input)


}