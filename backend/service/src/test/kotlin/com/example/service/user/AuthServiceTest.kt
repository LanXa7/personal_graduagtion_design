package com.example.service.user

import org.junit.jupiter.api.extension.ExtendWith
import org.springframework.test.context.junit.jupiter.SpringExtension

@ExtendWith(SpringExtension::class)
class AuthServiceTest {
//
//    private val userRepository: UserRepository = mockk()
//    private val jwtUtils: JwtUtils = mockk()
//    private val redissonUtils: RedissonUtils = mockk()
//    private val emailUtils: EmailUtils = mockk()
//    private lateinit var authService: AuthService
//
//    @BeforeEach
//    fun setup() {
//        MockKAnnotations.init(this)
//        authService = AuthService(userRepository, jwtUtils, redissonUtils, emailUtils)
//        // mock TransactionService 单例，避免未初始化异常
//        val mockTransactionManager = mockk<PlatformTransactionManager>(relaxed = true)
//        val mockTransactionTemplate = mockk<TransactionTemplate>(relaxed = true)
//        val transactionService = mockk<TransactionService>(relaxed = true)
//        every { transactionService.executeInTransaction(any<() -> Any>()) } answers { firstArg<() -> Any>().invoke() }
//        // 直接用 Companion
//        val instanceField = TransactionService::class.java.getDeclaredField("instance")
//        instanceField.isAccessible = true
//        instanceField.set(TransactionService.Companion, transactionService)
//        // mock StpUtil 静态方法
//        mockkStatic("cn.dev33.satoken.stp.StpUtil")
//        every { StpUtil.login(any()) } just Runs
//        every { StpUtil.getTokenValue() } returns "token123"
//        every { StpUtil.getTokenTimeout() } returns 3600L
//        every { StpUtil.getRoleList() } returns listOf("NORMAL")
//        every { StpUtil.getPermissionList() } returns listOf("read")
//        every { StpUtil.logout() } just Runs
//    }
//
//    @AfterEach
//    fun tearDown() {
//        clearAllMocks()
//    }
//
//    @Nested
//    @DisplayName("登录测试")
//    inner class SignInTest {
//
//        @Test
//        @DisplayName("登录成功")
//        fun `should sign in successfully`() {
//            // Given
//            val input = UserLoginInput(
//                username = "testUser",
//                password = "password123"
//            )
//
//            val user = User {
//                id = 1L
//                username = "testUser"
//                password = BCrypt.hashpw("password123")
//                email = "test@example.com"
//            }
//
//            every { userRepository.findUserByUsername(input.username) } returns user
//            every { StpUtil.login(any()) } just Runs
//            every { StpUtil.getTokenValue() } returns "token123"
//            every { StpUtil.getTokenTimeout() } returns 3600L
//            every { StpUtil.getRoleList() } returns listOf("NORMAL")
//            every { StpUtil.getPermissionList() } returns listOf("read")
//
//            // When
//            val result = authService.signIn(input)
//
//            // Then
//            assertEquals("token123", result.token)
//            assertEquals(3600L, result.expire)
//            assertEquals(listOf("NORMAL"), result.roles)
//            assertEquals(listOf("read"), result.permissions)
//
//            verify {
//                userRepository.findUserByUsername(input.username)
//                StpUtil.login(1L)
//            }
//        }
//
//        @Test
//        @DisplayName("密码错误")
//        fun `should throw exception when password is incorrect`() {
//            // Given
//            val input = UserLoginInput(
//                username = "testUser",
//                password = "wrongPassword"
//            )
//
//            val user = User {
//                id = 1L
//                username = "testUser"
//                password = BCrypt.hashpw("password123")
//            }
//
//            every { userRepository.findUserByUsername(input.username) } returns user
//
//            // When & Then
//            assertThrows<UsernameOrPasswordException> {
//                authService.signIn(input)
//            }
//        }
//    }
//
//    @Nested
//    @DisplayName("邮箱验证码测试")
//    inner class EmailVerifyTest {
//
//        @Test
//        @DisplayName("成功发送验证码")
//        fun `should send verify code successfully`() {
//            // Given
//            val email = "test@example.com"
//            val type = EmailType.REGISTER
//            val address = "127.0.0.1"
//
//            every { userRepository.isEmailExists(email) } returns false
//            every { emailUtils.getVerifyCode(email, type, address) } just Runs
//
//            // When & Then
//            assertDoesNotThrow {
//                authService.queryEmailVerifyCode(email, type, address)
//            }
//
//            verify {
//                userRepository.isEmailExists(email)
//                emailUtils.getVerifyCode(email, type, address)
//            }
//        }
//
//        @Test
//        @DisplayName("邮箱已存在")
//        fun `should throw exception when email exists`() {
//            // Given
//            val email = "test@example.com"
//            val type = EmailType.REGISTER
//            val address = "127.0.0.1"
//
//            every { userRepository.isEmailExists(email) } returns true
//
//            // When & Then
//            assertThrows<UsernameOrEmailAlreadyExistsException> {
//                authService.queryEmailVerifyCode(email, type, address)
//            }
//        }
//    }
//
//    @Nested
//    @DisplayName("注册测试")
//    inner class SignUpTest {
//
//        @Test
//        @DisplayName("注册成功")
//        fun `should sign up successfully`() {
//            // Given
//            val input = UserRegisterInput(
//                username = "newUser",
//                phone = "1234567890",
//                password = "password123",
//                email = "new@example.com",
//                code = "123456"
//            )
//
//            every { userRepository.isUserNameExists(input.username) } returns false
//            every { userRepository.isEmailExists(input.email) } returns false
//            every { redissonUtils.auth.getEmailVerifyCode(input.email) } returns "123456"
//            // FIXME 填写泛型，太困了先睡了
////            every { userRepository.save(any<User>(), any(), any(), any()) } returns mockk()
//            every { redissonUtils.auth.deleteEmailVerifyCode(input.email) } returns true
//
//            // When & Then
//            assertDoesNotThrow {
//                authService.signUp(input)
//            }
//
//            verify {
//                userRepository.isUserNameExists(input.username)
//                userRepository.isEmailExists(input.email)
//                redissonUtils.auth.getEmailVerifyCode(input.email)
////                // FIXME 填写泛型，太困了先睡了
////                userRepository.save(any<User>(), any(), any(), any())
//                redissonUtils.auth.deleteEmailVerifyCode(input.email)
//            }
//        }
//
//        @Test
//        @DisplayName("验证码不存在")
//        fun `should throw exception when code not exists`() {
//            // Given
//            val input = UserRegisterInput(
//                username = "newUser",
//                password = "password123",
//                phone = "1234567890",
//                email = "new@example.com",
//                code = "123456"
//            )
//
//            every { userRepository.isUserNameExists(input.username) } returns false
//            every { userRepository.isEmailExists(input.email) } returns false
//            every { redissonUtils.auth.getEmailVerifyCode(input.email) } returns null
//
//            // When & Then
//            assertThrows<CodeIsNotExistsException> {
//                authService.signUp(input)
//            }
//        }
//    }
//
//    @Nested
//    @DisplayName("重置密码测试")
//    inner class ResetPasswordTest {
//
//        @Test
//        @DisplayName("重置密码成功")
//        fun `should reset password successfully`() {
//            // Given
//            val input = UserResetPasswordInput(
//                email = "test@example.com",
//                password = "newPassword123",
//                code = "123456"
//            )
//
//            every { redissonUtils.auth.getEmailVerifyCode(input.email) } returns "123456"
//            every { userRepository.findUserIdByUsername(input.email) } returns 1L
////            // FIXME 填写泛型，太困了先睡了
////            every { userRepository.save(any<User>(), any(), any(), any()) } returns mockk()
//            every { redissonUtils.auth.deleteEmailVerifyCode(input.email) } returns true
//
//            // When & Then
//            assertDoesNotThrow {
//                authService.resetPassword(input)
//            }
//
//            verify {
//                redissonUtils.auth.getEmailVerifyCode(input.email)
//                userRepository.findUserIdByUsername(input.email)
////                // FIXME 填写泛型，太困了先睡了
////                userRepository.save(any<User>(), any(), any(), any())
//                redissonUtils.auth.deleteEmailVerifyCode(input.email)
//            }
//        }
//
//        @Test
//        @DisplayName("验证码错误")
//        fun `should throw exception when code is incorrect`() {
//            // Given
//            val input = UserResetPasswordInput(
//                email = "test@example.com",
//                password = "newPassword123",
//                code = "wrong123"
//            )
//
//            every { redissonUtils.auth.getEmailVerifyCode(input.email) } returns "123456"
//
//            // When & Then
//            assertThrows<CodeIsNotTrueException> {
//                authService.resetPassword(input)
//            }
//        }
//    }
//
//    @Nested
//    @DisplayName("登出测试")
//    inner class LogoutTest {
//
//        @Test
//        @DisplayName("登出成功")
//        fun `should logout successfully`() {
//            // Given
//            every { StpUtil.getTokenValue() } returns "token123"
//            every { jwtUtils.invalidateJwt("token123") } returns true
//            every { StpUtil.logout() } just Runs
//
//            // When
//            authService.logout()
//
//            // Then
//            verify {
//                StpUtil.getTokenValue()
//                jwtUtils.invalidateJwt("token123")
//                StpUtil.logout()
//            }
//        }
//    }
} 