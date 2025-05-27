import { EditPen, Lock, Message, User, Phone } from "@element-plus/icons-vue";
import router from "@/router";
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
const form = reactive({
    username: '',
    password: '',
    password_repeat: '',
    email: '',
    phone: '',
    code: ''
});
const validateUsername = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请输入用户名'));
    }
    else if (!/^[a-zA-Z0-9\u4e00-\u9fa5]+$/.test(value)) {
        callback(new Error('用户名不能包含特殊字符，只能是中文/英文'));
    }
    else {
        callback();
    }
};
const validatePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'));
    }
    else if (value !== form.password) {
        callback(new Error("两次输入的密码不一致"));
    }
    else {
        callback();
    }
};
const rules = {
    username: [
        { validator: validateUsername, trigger: ['blur', 'change'] },
        { min: 2, max: 8, message: '用户名的长度必须在2-8个字符之间', trigger: ['blur', 'change'] },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码的长度必须在6-16个字符之间', trigger: ['blur', 'change'] }
    ],
    password_repeat: [
        { validator: validatePassword, trigger: ['blur', 'change'] },
    ],
    email: [
        { required: true, message: '请输入邮件地址', trigger: 'blur' },
        { type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change'] }
    ],
    phone: [
        { required: true, message: '请输入电话号码', trigger: 'blur' },
    ],
    code: [
        { required: true, message: '请输入获取的验证码', trigger: 'blur' },
    ]
};
const formRef = ref();
const isEmailValid = ref(false);
const coldTime = ref(0);
const onValidate = (prop, isValid) => {
    if (prop === 'email')
        isEmailValid.value = isValid;
};
const register = () => {
    formRef.value.validate((isValid) => {
        if (isValid) {
            Apis.AuthController.signUp({
                data: {
                    username: form.username,
                    password: form.password,
                    email: form.email,
                    phone: form.phone,
                    code: form.code,
                }
            }).then(() => {
                ElMessage.success('注册成功，欢迎加入我们');
                router.push("/");
            });
        }
    });
};
const validateEmail = () => {
    coldTime.value = 60;
    Apis.AuthController.queryCode({
        data: {
            email: form.email,
            type: 'register',
        }
    }).then(response => {
        const handle = setInterval(() => {
            coldTime.value--;
            if (coldTime.value === 0) {
                clearInterval(handle);
            }
        }, 1000);
        ElMessage.success(`验证码已发送到邮箱: ${form.email}，请注意查收`);
    }).catch(() => {
        coldTime.value = 0;
        ElMessage.error('获取验证码失败');
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
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
        ...{ 'onValidate': {} },
        model: ((__VLS_ctx.form)),
        rules: ((__VLS_ctx.rules)),
        ref: ("formRef"),
    }));
    const __VLS_2 = __VLS_1({
        ...{ 'onValidate': {} },
        model: ((__VLS_ctx.form)),
        rules: ((__VLS_ctx.rules)),
        ref: ("formRef"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    // @ts-ignore navigation for `const formRef = ref()`
    /** @type { typeof __VLS_ctx.formRef } */ ;
    var __VLS_6 = {};
    let __VLS_7;
    const __VLS_8 = {
        onValidate: (__VLS_ctx.onValidate)
    };
    let __VLS_3;
    let __VLS_4;
    const __VLS_9 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_10 = __VLS_asFunctionalComponent(__VLS_9, new __VLS_9({
        prop: ("username"),
    }));
    const __VLS_11 = __VLS_10({
        prop: ("username"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_10));
    const __VLS_15 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_16 = __VLS_asFunctionalComponent(__VLS_15, new __VLS_15({
        modelValue: ((__VLS_ctx.form.username)),
        maxlength: ((8)),
        type: ("text"),
        placeholder: ("用户名"),
    }));
    const __VLS_17 = __VLS_16({
        modelValue: ((__VLS_ctx.form.username)),
        maxlength: ((8)),
        type: ("text"),
        placeholder: ("用户名"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_16));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_20.slots;
        const __VLS_21 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_22 = __VLS_asFunctionalComponent(__VLS_21, new __VLS_21({}));
        const __VLS_23 = __VLS_22({}, ...__VLS_functionalComponentArgsRest(__VLS_22));
        const __VLS_27 = {}.User;
        /** @type { [typeof __VLS_components.User, ] } */ ;
        // @ts-ignore
        const __VLS_28 = __VLS_asFunctionalComponent(__VLS_27, new __VLS_27({}));
        const __VLS_29 = __VLS_28({}, ...__VLS_functionalComponentArgsRest(__VLS_28));
        __VLS_26.slots.default;
        var __VLS_26;
    }
    var __VLS_20;
    __VLS_14.slots.default;
    var __VLS_14;
    const __VLS_33 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
        prop: ("password"),
    }));
    const __VLS_35 = __VLS_34({
        prop: ("password"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_34));
    const __VLS_39 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
        modelValue: ((__VLS_ctx.form.password)),
        maxlength: ((16)),
        type: ("password"),
        placeholder: ("密码"),
    }));
    const __VLS_41 = __VLS_40({
        modelValue: ((__VLS_ctx.form.password)),
        maxlength: ((16)),
        type: ("password"),
        placeholder: ("密码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_40));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_44.slots;
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
    var __VLS_44;
    __VLS_38.slots.default;
    var __VLS_38;
    const __VLS_57 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_58 = __VLS_asFunctionalComponent(__VLS_57, new __VLS_57({
        prop: ("password_repeat"),
    }));
    const __VLS_59 = __VLS_58({
        prop: ("password_repeat"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_58));
    const __VLS_63 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
        modelValue: ((__VLS_ctx.form.password_repeat)),
        maxlength: ((16)),
        type: ("password"),
        placeholder: ("重复密码"),
    }));
    const __VLS_65 = __VLS_64({
        modelValue: ((__VLS_ctx.form.password_repeat)),
        maxlength: ((16)),
        type: ("password"),
        placeholder: ("重复密码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_64));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_68.slots;
        const __VLS_69 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({}));
        const __VLS_71 = __VLS_70({}, ...__VLS_functionalComponentArgsRest(__VLS_70));
        const __VLS_75 = {}.Lock;
        /** @type { [typeof __VLS_components.Lock, ] } */ ;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({}));
        const __VLS_77 = __VLS_76({}, ...__VLS_functionalComponentArgsRest(__VLS_76));
        __VLS_74.slots.default;
        var __VLS_74;
    }
    var __VLS_68;
    __VLS_62.slots.default;
    var __VLS_62;
    const __VLS_81 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({
        prop: ("email"),
    }));
    const __VLS_83 = __VLS_82({
        prop: ("email"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_82));
    const __VLS_87 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({
        modelValue: ((__VLS_ctx.form.email)),
        type: ("email"),
        placeholder: ("电子邮件地址"),
    }));
    const __VLS_89 = __VLS_88({
        modelValue: ((__VLS_ctx.form.email)),
        type: ("email"),
        placeholder: ("电子邮件地址"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_88));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_92.slots;
        const __VLS_93 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({}));
        const __VLS_95 = __VLS_94({}, ...__VLS_functionalComponentArgsRest(__VLS_94));
        const __VLS_99 = {}.Message;
        /** @type { [typeof __VLS_components.Message, ] } */ ;
        // @ts-ignore
        const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({}));
        const __VLS_101 = __VLS_100({}, ...__VLS_functionalComponentArgsRest(__VLS_100));
        __VLS_98.slots.default;
        var __VLS_98;
    }
    var __VLS_92;
    __VLS_86.slots.default;
    var __VLS_86;
    const __VLS_105 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_106 = __VLS_asFunctionalComponent(__VLS_105, new __VLS_105({
        prop: ("phone"),
    }));
    const __VLS_107 = __VLS_106({
        prop: ("phone"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_106));
    const __VLS_111 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_112 = __VLS_asFunctionalComponent(__VLS_111, new __VLS_111({
        modelValue: ((__VLS_ctx.form.phone)),
        type: ("text"),
        placeholder: ("电话号码"),
    }));
    const __VLS_113 = __VLS_112({
        modelValue: ((__VLS_ctx.form.phone)),
        type: ("text"),
        placeholder: ("电话号码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_112));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_116.slots;
        const __VLS_117 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_118 = __VLS_asFunctionalComponent(__VLS_117, new __VLS_117({}));
        const __VLS_119 = __VLS_118({}, ...__VLS_functionalComponentArgsRest(__VLS_118));
        const __VLS_123 = {}.Phone;
        /** @type { [typeof __VLS_components.Phone, ] } */ ;
        // @ts-ignore
        const __VLS_124 = __VLS_asFunctionalComponent(__VLS_123, new __VLS_123({}));
        const __VLS_125 = __VLS_124({}, ...__VLS_functionalComponentArgsRest(__VLS_124));
        __VLS_122.slots.default;
        var __VLS_122;
    }
    var __VLS_116;
    __VLS_110.slots.default;
    var __VLS_110;
    const __VLS_129 = {}.ElFormItem;
    /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
    // @ts-ignore
    const __VLS_130 = __VLS_asFunctionalComponent(__VLS_129, new __VLS_129({
        prop: ("code"),
    }));
    const __VLS_131 = __VLS_130({
        prop: ("code"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_130));
    const __VLS_135 = {}.ElRow;
    /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
    // @ts-ignore
    const __VLS_136 = __VLS_asFunctionalComponent(__VLS_135, new __VLS_135({
        gutter: ((10)),
        ...{ style: ({}) },
    }));
    const __VLS_137 = __VLS_136({
        gutter: ((10)),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_136));
    const __VLS_141 = {}.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
    // @ts-ignore
    const __VLS_142 = __VLS_asFunctionalComponent(__VLS_141, new __VLS_141({
        span: ((17)),
    }));
    const __VLS_143 = __VLS_142({
        span: ((17)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_142));
    const __VLS_147 = {}.ElInput;
    /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
    // @ts-ignore
    const __VLS_148 = __VLS_asFunctionalComponent(__VLS_147, new __VLS_147({
        modelValue: ((__VLS_ctx.form.code)),
        maxlength: ((6)),
        type: ("text"),
        placeholder: ("请输入验证码"),
    }));
    const __VLS_149 = __VLS_148({
        modelValue: ((__VLS_ctx.form.code)),
        maxlength: ((6)),
        type: ("text"),
        placeholder: ("请输入验证码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_148));
    __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
    {
        const { prefix: __VLS_thisSlot } = __VLS_152.slots;
        const __VLS_153 = {}.ElIcon;
        /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
        // @ts-ignore
        const __VLS_154 = __VLS_asFunctionalComponent(__VLS_153, new __VLS_153({}));
        const __VLS_155 = __VLS_154({}, ...__VLS_functionalComponentArgsRest(__VLS_154));
        const __VLS_159 = {}.EditPen;
        /** @type { [typeof __VLS_components.EditPen, ] } */ ;
        // @ts-ignore
        const __VLS_160 = __VLS_asFunctionalComponent(__VLS_159, new __VLS_159({}));
        const __VLS_161 = __VLS_160({}, ...__VLS_functionalComponentArgsRest(__VLS_160));
        __VLS_158.slots.default;
        var __VLS_158;
    }
    var __VLS_152;
    __VLS_146.slots.default;
    var __VLS_146;
    const __VLS_165 = {}.ElCol;
    /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
    // @ts-ignore
    const __VLS_166 = __VLS_asFunctionalComponent(__VLS_165, new __VLS_165({
        span: ((5)),
    }));
    const __VLS_167 = __VLS_166({
        span: ((5)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_166));
    const __VLS_171 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_172 = __VLS_asFunctionalComponent(__VLS_171, new __VLS_171({
        ...{ 'onClick': {} },
        type: ("success"),
        disabled: ((!__VLS_ctx.isEmailValid || __VLS_ctx.coldTime > 0)),
    }));
    const __VLS_173 = __VLS_172({
        ...{ 'onClick': {} },
        type: ("success"),
        disabled: ((!__VLS_ctx.isEmailValid || __VLS_ctx.coldTime > 0)),
    }, ...__VLS_functionalComponentArgsRest(__VLS_172));
    let __VLS_177;
    const __VLS_178 = {
        onClick: (__VLS_ctx.validateEmail)
    };
    let __VLS_174;
    let __VLS_175;
    (__VLS_ctx.coldTime > 0 ? '请稍后 ' + __VLS_ctx.coldTime + ' 秒' : '获取验证码');
    __VLS_176.slots.default;
    var __VLS_176;
    __VLS_170.slots.default;
    var __VLS_170;
    __VLS_140.slots.default;
    var __VLS_140;
    __VLS_134.slots.default;
    var __VLS_134;
    __VLS_5.slots.default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    const __VLS_179 = {}.ElButton;
    /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
    // @ts-ignore
    const __VLS_180 = __VLS_asFunctionalComponent(__VLS_179, new __VLS_179({
        ...{ 'onClick': {} },
        ...{ style: ({}) },
        type: ("warning"),
        plain: (true),
    }));
    const __VLS_181 = __VLS_180({
        ...{ 'onClick': {} },
        ...{ style: ({}) },
        type: ("warning"),
        plain: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_180));
    let __VLS_185;
    const __VLS_186 = {
        onClick: (__VLS_ctx.register)
    };
    let __VLS_182;
    let __VLS_183;
    __VLS_184.slots.default;
    var __VLS_184;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
        ...{ style: ({}) },
    });
    const __VLS_187 = {}.ElLink;
    /** @type { [typeof __VLS_components.ElLink, typeof __VLS_components.elLink, typeof __VLS_components.ElLink, typeof __VLS_components.elLink, ] } */ ;
    // @ts-ignore
    const __VLS_188 = __VLS_asFunctionalComponent(__VLS_187, new __VLS_187({
        ...{ 'onClick': {} },
        type: ("primary"),
        ...{ style: ({}) },
    }));
    const __VLS_189 = __VLS_188({
        ...{ 'onClick': {} },
        type: ("primary"),
        ...{ style: ({}) },
    }, ...__VLS_functionalComponentArgsRest(__VLS_188));
    let __VLS_193;
    const __VLS_194 = {
        onClick: (...[$event]) => {
            __VLS_ctx.router.push('/');
        }
    };
    let __VLS_190;
    let __VLS_191;
    __VLS_192.slots.default;
    var __VLS_192;
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
            EditPen: EditPen,
            Lock: Lock,
            Message: Message,
            User: User,
            Phone: Phone,
            router: router,
            form: form,
            rules: rules,
            formRef: formRef,
            isEmailValid: isEmailValid,
            coldTime: coldTime,
            onValidate: onValidate,
            register: register,
            validateEmail: validateEmail,
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
