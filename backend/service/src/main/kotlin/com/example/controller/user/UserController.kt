package com.example.controller.user

import cn.dev33.satoken.annotation.SaCheckRole
import com.example.model.common.Const
import com.example.model.entity.user.User
import com.example.model.entity.user.dto.*
import com.example.service.file.ImageService
import com.example.service.user.UserService
import com.example.utils.MyStpUtils
import jakarta.validation.Valid
import org.babyfish.jimmer.Page
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/user")
class UserController(
    private val userService: UserService,
    private val imageService: ImageService
) {

    /**
     *  获取用户信息
     */
    @GetMapping
    fun queryUserInfo(): UserInfoView =
        userService.queryUserInfoBy(MyStpUtils.getCurrentUserId())

    /**
     * 获取全部用户信息
     */
    @GetMapping("/page")
    fun pageUser(
        @RequestParam(defaultValue = "0") pageIndex: Int,
        @RequestParam(defaultValue = "10") pageSize: Int,
        @RequestParam username: String?
    ): Page<User> =
        userService.pageUser(pageIndex, pageSize, username)

    /**
     * 上传头像
     */
    @PostMapping("/avatar")
    fun uploadAvatar(@RequestPart("file") file: MultipartFile): String =
        imageService.uploadAvatar(file, MyStpUtils.getCurrentUserId())

    /**
     * 修改邮箱
     */
    @PutMapping("/email")
    fun updateEmail(
        @RequestBody @Valid input: UserUpdateEmailInput
    ) =
        userService.updateEmail(MyStpUtils.getCurrentUserId(), input)

    /**
     * 修改密码
     */
    @PutMapping("/password")
    fun updatePassword(
        @RequestBody @Valid input: UserUpdatePasswordInput
    ) =
        userService.updatePassword(MyStpUtils.getCurrentUserId(), input)

    /**
     * 修改用户绑定的角色
     */
    @PutMapping("/role")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun updateUserRole(
        @RequestBody input: UserUpdateRoleInput
    ) =
        userService.updateUserRole(input)

    @PostMapping("/import")
    fun importUser(
        @RequestPart("file") file: MultipartFile
    ) =
        userService.importUser(file)

    @DeleteMapping("/{id}")
    fun deleteUser(
        @PathVariable("id") id: Long
    ) =
        userService.deleteUser(id)

    /**
     * 重置员工密码
     */
    @PatchMapping("/{userId}")
    @SaCheckRole(value = [Const.SUPER_ADMIN])
    fun resetUserPassword(
        @PathVariable userId: Long,
        @RequestBody @Valid input: UserAdminResetPasswordInput
    ) =
        userService.resetUserPassword(userId, input)

}