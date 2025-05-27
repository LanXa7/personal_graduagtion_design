package com.example.interceptor

import cn.dev33.satoken.stp.StpUtil
import com.example.model.common.BaseModifier
import com.example.model.common.BaseModifierDraft
import com.example.utils.MyStpUtils
import org.babyfish.jimmer.kt.isLoaded
import org.babyfish.jimmer.sql.DraftInterceptor
import org.springframework.stereotype.Component

@Component
class BaseModifierDraftInterceptor : DraftInterceptor<BaseModifier, BaseModifierDraft> {

    override fun beforeSave(draft: BaseModifierDraft, original: BaseModifier?) {
        if (!isLoaded(draft, BaseModifier::modifier)) {
            if (StpUtil.isLogin()) {
                draft.modifier = MyStpUtils.getCurrentUserId()
            }
        }
    }

}