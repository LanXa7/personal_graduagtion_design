import { User, Lock } from '@element-plus/icons-vue';
import router from "@/router";
import { reactive, ref } from "vue";
import { storeAccessToken } from "@/utils/auth/index.ts";
import dayjs from "dayjs";
import { useDictStoreWithOut } from "@/store/dict.ts";
const formRef = ref();
const form = reactive({
    text: '',
    password: '',
    remember: false
});
const rules = {
    text: [
        { required: true, message: '请输入用户名' }
    ],
    password: [
        { required: true, message: '请输入密码' }
    ]
};
function userLogin() {
    formRef.value.validate((isValid) => {
        if (isValid) {
            Apis.AuthController.signIn({
                data: {
                    text: form.text,
                    password: form.password,
                }
            }).then(data => {
                console.log('Login response:', data);
                console.log('User roles:', data.roles);
                ElMessage.success("登录成功!");
                storeAccessToken(form.remember, data.token, dayjs().add(data.expire, 'second'), data.roles);
                // 检查存储是否成功
                const authStr = localStorage.getItem('authorize') || sessionStorage.getItem('authorize');
                if (authStr) {
                    console.log('Stored auth data:', JSON.parse(authStr));
                }
                router.push('/index');
                const dictStore = useDictStoreWithOut();
                if (!dictStore.getIsSetDict) {
                    dictStore.setDictMap();
                }
            });
        }
    });
}
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    const __VLS_0 = {}.ElForm;
    /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        model: ((__VLS_ctx.form)),
        rules: ((__VLS_ctx.rules)),
        ref: ("formRef"),
    }));
    const __VLS_2 = __VLS_1({
        model: ((__VLS_ctx.form)),
        rules: ((__VLS_ctx.rules)),
        ref: ("formRef"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const formRef = ref()`
    /** @type { typeof __VLS_ctx.formRef } */ ;
    var __VLS_6 = {};
    const __VLS_7 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_8 = __VLS_asFunctionalComponent(__VLS_7, new __VLS_7({
        prop: ("username"),
    }));
    const __VLS_9 = __VLS_8({
        prop: ("username"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_8));
    const __VLS_13 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_14 = __VLS_asFunctionalComponent(__VLS_13, new __VLS_13({
        modelValue: ((__VLS_ctx.form.text)),
        maxlength: ("10"),
        type: ("text"),
        placeholder: ("用户名/邮箱/手机号"),
    }));
    const __VLS_15 = __VLS_14({
        modelValue: ((__VLS_ctx.form.text)),
        maxlength: ("10"),
        type: ("text"),
        placeholder: ("用户名/邮箱/手机号"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_14));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_18.slots;
        const __VLS_19 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_20 = __VLS_asFunctionalComponent(__VLS_19, new __VLS_19({}));
        const __VLS_21 = __VLS_20({}, ...__VLS_functionalComponentArgsRest(__VLS_20));
        const __VLS_25 = {}.User;
        /** @type { [typeof __VLS_components.User, ] } */ ;
        // @ts-ignore
        const __VLS_26 = __VLS_asFunctionalComponent(__VLS_25, new __VLS_25({}));
        const __VLS_27 = __VLS_26({}, ...__VLS_functionalComponentArgsRest(__VLS_26));
        __VLS_24.slots.default;
        var __VLS_24;
    }
    var __VLS_18;
    __VLS_12.slots.default;
    var __VLS_12;
    const __VLS_31 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_32 = __VLS_asFunctionalComponent(__VLS_31, new __VLS_31({
        prop: ("password"),
    }));
    const __VLS_33 = __VLS_32({
        prop: ("password"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_32));
    const __VLS_37 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_38 = __VLS_asFunctionalComponent(__VLS_37, new __VLS_37({
        ...{ 'onKeyup': {} },
        modelValue: ((__VLS_ctx.form.password)),
        type: ("password"),
        maxlength: ("20"),
        ...{ style: ({}) },
        placeholder: ("密码"),
    }));
    const __VLS_39 = __VLS_38({
        ...{ 'onKeyup': {} },
        modelValue: ((__VLS_ctx.form.password)),
        type: ("password"),
        maxlength: ("20"),
        ...{ style: ({}) },
        placeholder: ("密码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_38));
    let __VLS_43;
    const __VLS_44 = {
        onKeyup: (__VLS_ctx.userLogin)
    };
    let __VLS_40;
    let __VLS_41;
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_42.slots;
        const __VLS_45 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({}));
        const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
        const __VLS_51 = {}.Lock;
        /** @type { [typeof __VLS_components.Lock, ] } */ ;
        // @ts-ignore
        const __VLS_52 = __VLS_asFunctionalComponent(__VLS_51, new __VLS_51({}));
        const __VLS_53 = __VLS_52({}, ...__VLS_functionalComponentArgsRest(__VLS_52));
        __VLS_50.slots.default;
        var __VLS_50;
    }
    var __VLS_42;
    __VLS_36.slots.default;
    var __VLS_36;
    const __VLS_57 = {}.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        ...{ style: ({}) },
    }));
    const __VLS_59 = __VLS_58({
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const __VLS_63 = {}.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        span: ((12)),
        ...{ style: ({}) },
    }));
    const __VLS_65 = __VLS_64({
        span: ((12)),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    const __VLS_69 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
        prop: ("remember"),
    }));
    const __VLS_71 = __VLS_70({
        prop: ("remember"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_70));
    const __VLS_75 = {}.ElCheckbox;
    /** @type { [typeof __VLS_components.ElCheckbox, typeof __VLS_components.elCheckbox, ] } */ ;
    // @ts-ignore
    const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
        modelValue: ((__VLS_ctx.form.remember)),
        label: ("记住我"),
    }));
    const __VLS_77 = __VLS_76({
        modelValue: ((__VLS_ctx.form.remember)),
        label: ("记住我"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_76));
    __VLS_74.slots.default;
    var __VLS_74;
    __VLS_68.slots.default;
    var __VLS_68;
    const __VLS_81 = {}.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        span: ((12)),
        ...{ style: ({}) },
    }));
    const __VLS_83 = __VLS_82({
        span: ((12)),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const __VLS_87 = {}.ElLink;
    /** @type { [typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ] } */ ;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
        ...{ 'onClick': {} },
    }));
    const __VLS_89 = __VLS_88({
        ...{ 'onClick': {} },
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    let __VLS_93;
    const __VLS_94 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push('/forget');
        }
    };
    let __VLS_90;
    let __VLS_91;
    __VLS_92.slots.default;
    var __VLS_92;
    __VLS_86.slots.default;
    var __VLS_86;
    __VLS_62.slots.default;
    var __VLS_62;
    __VLS_5.slots.default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    const __VLS_95 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_96 = __VLS_asFunctionalComponent(__VLS_95, new __VLS_95({
        ...{ 'onClick': {} },
        ...{ style: ({}) },
        type: ("success"),
        plain: (true),
    }));
    const __VLS_97 = __VLS_96({
        ...{ 'onClick': {} },
        ...{ style: ({}) },
        type: ("success"),
        plain: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_96));
    let __VLS_101;
    const __VLS_102 = {
        onClick: (...[$event]) => {
            __VLS_ctx.userLogin();
        }
    };
    let __VLS_98;
    let __VLS_99;
    __VLS_100.slots.default;
    var __VLS_100;
    const __VLS_103 = {}.ElDivider;
    /** @type { [typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, typeof __VLS_components.ElDivider, typeof __VLS_components.elDivider, ] } */ ;
    // @ts-ignore
    const __VLS_104 = __VLS_asFunctionalComponent(__VLS_103, new __VLS_103({}));
    const __VLS_105 = __VLS_104({}, ...__VLS_functionalComponentArgsRest(__VLS_104));
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: ({}) },
    });
    __VLS_108.slots.default;
    var __VLS_108;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    const __VLS_109 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_110 = __VLS_asFunctionalComponent(__VLS_109, new __VLS_109({
        ...{ 'onClick': {} },
        ...{ style: ({}) },
        type: ("warning"),
        plain: (true),
    }));
    const __VLS_111 = __VLS_110({
        ...{ 'onClick': {} },
        ...{ style: ({}) },
        type: ("warning"),
        plain: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_110));
    let __VLS_115;
    const __VLS_116 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push('/register');
        }
    };
    let __VLS_112;
    let __VLS_113;
    __VLS_114.slots.default;
    var __VLS_114;
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'formRef': __VLS_6,
    };
    var $refs;
    var $el;
    return {
        attrs: {},
        slots: __VLS_slots,
        refs: $refs,
        rootEl: $el,
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            User: User,
            Lock: Lock,
            router: router,
            formRef: formRef,
            form: form,
            rules: rules,
            userLogin: userLogin,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeRefs: {},
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
