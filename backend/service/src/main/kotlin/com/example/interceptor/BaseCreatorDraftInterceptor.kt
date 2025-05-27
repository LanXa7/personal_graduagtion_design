package com.example.interceptor

import cn.dev33.satoken.stp.StpUtil
import com.example.model.common.BaseCreator
import com.example.model.common.BaseCreatorDraft
import com.example.utils.MyStpUtils
import org.babyfish.jimmer.kt.isLoaded
import org.babyfish.jimmer.sql.DraftInterceptor
import org.springframework.stereotype.Component

@Component
class BaseCreatorDraftInterceptor : DraftInterceptor<BaseCreator, BaseCreatorDraft> {

    override fun beforeSave(draft: BaseCreatorDraft, original: BaseCreator?) {
        if (original === null && !isLoaded(draft, BaseCreator::creator)) {
            if (StpUtil.isLogin()) {
                draft.creator = MyStpUtils.getCurrentUserId()
            }
        }
    }

}