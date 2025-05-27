package com.example.listener

import cn.hutool.crypto.digest.BCrypt
import cn.idev.excel.context.AnalysisContext
import cn.idev.excel.read.listener.ReadListener
import cn.idev.excel.util.ListUtils
import com.example.ext.toJsonString
import com.example.ext.withTransaction
import com.example.http.request.UserImportRequest
import com.example.model.entity.user.User
import com.example.model.entity.user.addBy
import com.example.model.enums.Role
import com.example.repository.user.UserRepository
import io.github.oshai.kotlinlogging.KotlinLogging
import org.babyfish.jimmer.sql.ast.mutation.SaveMode

class UserImportListener(
    private val userRepository: UserRepository
) : ReadListener<UserImportRequest> {
    /**
     * 缓存的数据
     */
    private val caches: MutableList<User> =
        ListUtils.newArrayListWithExpectedSize(BATCH_COUNT)


    /**
     * 这个每一条数据解析都会来调用
     */
    override fun invoke(input: UserImportRequest, context: AnalysisContext?) {
        log.info { "解析到一条数据: ${input.toJsonString()}" }
        val user = User {
            this.username = input.username!!
            this.phone = input.phone!!
            this.email = input.email!!
            this.password = BCrypt.hashpw(DEFAULT_PASSWORD)
            this.roles().addBy {
                this.code = Role.NORMAL
            }
        }
        caches.add(user)
        // 达到BATCH_COUNT了，需要去存储一次数据库，防止数据几万条数据在内存，容易OOM
        if (caches.size >= BATCH_COUNT) {
            saveData()
            // 存储完成清理 list
            caches.clear()
        }
    }

    /**
     * 所有数据解析完成了 都会来调用
     *
     * @param context
     */
    override fun doAfterAllAnalysed(context: AnalysisContext?) {
        // 这里也要保存数据，确保最后遗留的数据也存储到数据库
        saveData()
        log.info { "所有数据解析完成!" }
    }

    /**
     * 加上存储数据库
     */
    private fun saveData() {
        log.info { "${caches.size}条数据，开始存储数据库!" }
        withTransaction {
            userRepository.saveEntities(caches) {
                setMode(SaveMode.INSERT_ONLY)
            }
        }
        log.info { "存储数据库成功!" }
    }


    companion object {
        /**
         * 每隔600条存储数据库,然后清理list,方便内存回收
         */
        private const val BATCH_COUNT: Int = 50
        private const val DEFAULT_PASSWORD = "123456"
        
        private val log = KotlinLogging.logger {}
    }
}