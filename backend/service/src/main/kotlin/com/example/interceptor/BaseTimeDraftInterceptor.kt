package com.example.interceptor

import com.example.model.common.BaseTime
import com.example.model.common.BaseTimeDraft
import org.babyfish.jimmer.kt.isLoaded
import org.babyfish.jimmer.sql.DraftInterceptor
import org.springframework.stereotype.Component
import java.time.LocalDateTime

@Component
class BaseTimeDraftInterceptor : DraftInterceptor<BaseTime, BaseTimeDraft> {

    override fun beforeSave(draft: BaseTimeDraft, original: BaseTime?) {
        if (!isLoaded(draft, BaseTime::modifyTime)) {
            draft.modifyTime = LocalDateTime.now()
        }
        if (original === null && !isLoaded(draft, BaseTime::createTime)) {
            draft.createTime = LocalDateTime.now()
        }

    }
}