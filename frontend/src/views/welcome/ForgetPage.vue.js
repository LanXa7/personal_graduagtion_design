import { EditPen, Lock, Message } from "@element-plus/icons-vue";
import { reactive, ref } from "vue";
import { ElMessage } from "element-plus";
import router from "@/router";
const active = ref(0);
const form = reactive({
    email: '',
    code: '',
    password: '',
    password_repeat: '',
});
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
    email: [
        { required: true, message: '请输入邮件地址', trigger: 'blur' },
        { type: 'email', message: '请输入合法的电子邮件地址', trigger: ['blur', 'change'] }
    ],
    code: [
        { required: true, message: '请输入获取的验证码', trigger: 'blur' },
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 6, max: 16, message: '密码的长度必须在6-16个字符之间', trigger: ['blur'] }
    ],
    password_repeat: [
        { validator: validatePassword, trigger: ['blur', 'change'] },
    ],
};
const formRef = ref();
const isEmailValid = ref(false);
const coldTime = ref(0);
const onValidate = (prop, isValid) => {
    if (prop === 'email')
        isEmailValid.value = isValid;
};
const validateEmail = () => {
    coldTime.value = 60;
    Apis.AuthController.queryCode({
        data: {
            email: form.email,
            type: 'reset',
        }
    }).then(response => {
        if (response) {
            const handle = setInterval(() => {
                coldTime.value--;
                if (coldTime.value === 0) {
                    clearInterval(handle);
                }
            }, 1000);
            ElMessage.success(`验证码已发送到邮箱: ${form.email}，请注意查收`);
        }
        else {
            coldTime.value = 0;
        }
    });
};
const confirmReset = () => {
    formRef.value.validate((isValid) => {
        if (isValid) {
            Apis.AuthController.confirm({
                params: {
                    email: form.email,
                    code: form.code
                }
            }).then(() => {
                active.value = 1;
            });
        }
    });
};
const doReset = () => {
    formRef.value.validate((isValid) => {
        if (isValid) {
            Apis.AuthController.resetPassword({
                data: {
                    email: form.email,
                    code: form.code,
                    password: form.password
                }
            }).then(() => {
                ElMessage.success("重置成功");
                router.push("/");
            });
        }
    });
}; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({});
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ style: ({}) },
    });
    const __VLS_0 = {}.ElSteps;
    /** @type { [typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, typeof __VLS_components.ElSteps, typeof __VLS_components.elSteps, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        active: ((__VLS_ctx.active)),
        finishStatus: ("success"),
        alignCenter: (true),
    }));
    const __VLS_2 = __VLS_1({
        active: ((__VLS_ctx.active)),
        finishStatus: ("success"),
        alignCenter: (true),
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    const __VLS_6 = {}.ElStep;
    /** @type { [typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ] } */ ;
    // @ts-ignore
    const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
        title: ("验证电子邮件"),
    }));
    const __VLS_8 = __VLS_7({
        title: ("验证电子邮件"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_7));
    const __VLS_12 = {}.ElStep;
    /** @type { [typeof __VLS_components.ElStep, typeof __VLS_components.elStep, ] } */ ;
    // @ts-ignore
    const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
        title: ("重新设定密码"),
    }));
    const __VLS_14 = __VLS_13({
        title: ("重新设定密码"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_13));
    __VLS_5.slots.default;
    var __VLS_5;
    const __VLS_18 = {}.transition;
    /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ] } */ ;
    // @ts-ignore
    const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
        name: ("el-fade-in-linear"),
        mode: ("out-in"),
    }));
    const __VLS_20 = __VLS_19({
        name: ("el-fade-in-linear"),
        mode: ("out-in"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_19));
    if (__VLS_ctx.active === 0) {
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
        const __VLS_24 = {}.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            ...{ 'onValidate': {} },
            model: ((__VLS_ctx.form)),
            rules: ((__VLS_ctx.rules)),
            ref: ("formRef"),
        }));
        const __VLS_26 = __VLS_25({
            ...{ 'onValidate': {} },
            model: ((__VLS_ctx.form)),
            rules: ((__VLS_ctx.rules)),
            ref: ("formRef"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
        // @ts-ignore navigation for `const formRef = ref()`
        /** @type { typeof __VLS_ctx.formRef } */ ;
        var __VLS_30 = {};
        let __VLS_31;
        const __VLS_32 = {
            onValidate: (__VLS_ctx.onValidate)
        };
        let __VLS_27;
        let __VLS_28;
        const __VLS_33 = {}.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
        // @ts-ignore
        const __VLS_34 = __VLS_asFunctionalComponent(__VLS_33, new __VLS_33({
            prop: ("email"),
        }));
        const __VLS_35 = __VLS_34({
            prop: ("email"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_34));
        const __VLS_39 = {}.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
        // @ts-ignore
        const __VLS_40 = __VLS_asFunctionalComponent(__VLS_39, new __VLS_39({
            modelValue: ((__VLS_ctx.form.email)),
            type: ("email"),
            placeholder: ("电子邮件地址"),
        }));
        const __VLS_41 = __VLS_40({
            modelValue: ((__VLS_ctx.form.email)),
            type: ("email"),
            placeholder: ("电子邮件地址"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_40));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { prefix: __VLS_thisSlot } = __VLS_44.slots;
            const __VLS_45 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_46 = __VLS_asFunctionalComponent(__VLS_45, new __VLS_45({}));
            const __VLS_47 = __VLS_46({}, ...__VLS_functionalComponentArgsRest(__VLS_46));
            const __VLS_51 = {}.Message;
            /** @type { [typeof __VLS_components.Message, ] } */ ;
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
            prop: ("code"),
        }));
        const __VLS_59 = __VLS_58({
            prop: ("code"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_58));
        const __VLS_63 = {}.ElRow;
        /** @type { [typeof __VLS_components.ElRow, typeof __VLS_components.elRow, typeof __VLS_components.ElRow, typeof __VLS_components.elRow, ] } */ ;
        // @ts-ignore
        const __VLS_64 = __VLS_asFunctionalComponent(__VLS_63, new __VLS_63({
            gutter: ((10)),
            ...{ style: ({}) },
        }));
        const __VLS_65 = __VLS_64({
            gutter: ((10)),
            ...{ style: ({}) },
        }, ...__VLS_functionalComponentArgsRest(__VLS_64));
        const __VLS_69 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_70 = __VLS_asFunctionalComponent(__VLS_69, new __VLS_69({
            span: ((17)),
        }));
        const __VLS_71 = __VLS_70({
            span: ((17)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_70));
        const __VLS_75 = {}.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
        // @ts-ignore
        const __VLS_76 = __VLS_asFunctionalComponent(__VLS_75, new __VLS_75({
            modelValue: ((__VLS_ctx.form.code)),
            maxlength: ((6)),
            type: ("text"),
            placeholder: ("请输入验证码"),
        }));
        const __VLS_77 = __VLS_76({
            modelValue: ((__VLS_ctx.form.code)),
            maxlength: ((6)),
            type: ("text"),
            placeholder: ("请输入验证码"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_76));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { prefix: __VLS_thisSlot } = __VLS_80.slots;
            const __VLS_81 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_82 = __VLS_asFunctionalComponent(__VLS_81, new __VLS_81({}));
            const __VLS_83 = __VLS_82({}, ...__VLS_functionalComponentArgsRest(__VLS_82));
            const __VLS_87 = {}.EditPen;
            /** @type { [typeof __VLS_components.EditPen, ] } */ ;
            // @ts-ignore
            const __VLS_88 = __VLS_asFunctionalComponent(__VLS_87, new __VLS_87({}));
            const __VLS_89 = __VLS_88({}, ...__VLS_functionalComponentArgsRest(__VLS_88));
            __VLS_86.slots.default;
            var __VLS_86;
        }
        var __VLS_80;
        __VLS_74.slots.default;
        var __VLS_74;
        const __VLS_93 = {}.ElCol;
        /** @type { [typeof __VLS_components.ElCol, typeof __VLS_components.elCol, typeof __VLS_components.ElCol, typeof __VLS_components.elCol, ] } */ ;
        // @ts-ignore
        const __VLS_94 = __VLS_asFunctionalComponent(__VLS_93, new __VLS_93({
            span: ((5)),
        }));
        const __VLS_95 = __VLS_94({
            span: ((5)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_94));
        const __VLS_99 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_100 = __VLS_asFunctionalComponent(__VLS_99, new __VLS_99({
            ...{ 'onClick': {} },
            type: ("success"),
            disabled: ((!__VLS_ctx.isEmailValid || __VLS_ctx.coldTime > 0)),
        }));
        const __VLS_101 = __VLS_100({
            ...{ 'onClick': {} },
            type: ("success"),
            disabled: ((!__VLS_ctx.isEmailValid || __VLS_ctx.coldTime > 0)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_100));
        let __VLS_105;
        const __VLS_106 = {
            onClick: (__VLS_ctx.validateEmail)
        };
        let __VLS_102;
        let __VLS_103;
        (__VLS_ctx.coldTime > 0 ? '请稍后 ' + __VLS_ctx.coldTime + ' 秒' : '获取验证码');
        __VLS_104.slots.default;
        var __VLS_104;
        __VLS_98.slots.default;
        var __VLS_98;
        __VLS_68.slots.default;
        var __VLS_68;
        __VLS_62.slots.default;
        var __VLS_62;
        __VLS_29.slots.default;
        var __VLS_29;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: ({}) },
        });
        const __VLS_107 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_108 = __VLS_asFunctionalComponent(__VLS_107, new __VLS_107({
            ...{ 'onClick': {} },
            ...{ style: ({}) },
            type: ("danger"),
            plain: (true),
        }));
        const __VLS_109 = __VLS_108({
            ...{ 'onClick': {} },
            ...{ style: ({}) },
            type: ("danger"),
            plain: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_108));
        let __VLS_113;
        const __VLS_114 = {
            onClick: (...[$event]) => {
                if (!((__VLS_ctx.active === 0)))
                    return;
                __VLS_ctx.confirmReset();
            }
        };
        let __VLS_110;
        let __VLS_111;
        __VLS_112.slots.default;
        var __VLS_112;
    }
    __VLS_23.slots.default;
    var __VLS_23;
    const __VLS_115 = {}.transition;
    /** @type { [typeof __VLS_components.Transition, typeof __VLS_components.transition, typeof __VLS_components.Transition, typeof __VLS_components.transition, ] } */ ;
    // @ts-ignore
    const __VLS_116 = __VLS_asFunctionalComponent(__VLS_115, new __VLS_115({
        name: ("el-fade-in-linear"),
        mode: ("out-in"),
    }));
    const __VLS_117 = __VLS_116({
        name: ("el-fade-in-linear"),
        mode: ("out-in"),
    }, ...__VLS_functionalComponentArgsRest(__VLS_116));
    if (__VLS_ctx.active === 1) {
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
        const __VLS_121 = {}.ElForm;
        /** @type { [typeof __VLS_components.ElForm, typeof __VLS_components.elForm, typeof __VLS_components.ElForm, typeof __VLS_components.elForm, ] } */ ;
        // @ts-ignore
        const __VLS_122 = __VLS_asFunctionalComponent(__VLS_121, new __VLS_121({
            ...{ 'onValidate': {} },
            model: ((__VLS_ctx.form)),
            rules: ((__VLS_ctx.rules)),
            ref: ("formRef"),
        }));
        const __VLS_123 = __VLS_122({
            ...{ 'onValidate': {} },
            model: ((__VLS_ctx.form)),
            rules: ((__VLS_ctx.rules)),
            ref: ("formRef"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_122));
        // @ts-ignore navigation for `const formRef = ref()`
        /** @type { typeof __VLS_ctx.formRef } */ ;
        var __VLS_127 = {};
        let __VLS_128;
        const __VLS_129 = {
            onValidate: (__VLS_ctx.onValidate)
        };
        let __VLS_124;
        let __VLS_125;
        const __VLS_130 = {}.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
        // @ts-ignore
        const __VLS_131 = __VLS_asFunctionalComponent(__VLS_130, new __VLS_130({
            prop: ("password"),
        }));
        const __VLS_132 = __VLS_131({
            prop: ("password"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_131));
        const __VLS_136 = {}.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
        // @ts-ignore
        const __VLS_137 = __VLS_asFunctionalComponent(__VLS_136, new __VLS_136({
            modelValue: ((__VLS_ctx.form.password)),
            maxlength: ((16)),
            type: ("password"),
            placeholder: ("新密码"),
        }));
        const __VLS_138 = __VLS_137({
            modelValue: ((__VLS_ctx.form.password)),
            maxlength: ((16)),
            type: ("password"),
            placeholder: ("新密码"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_137));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { prefix: __VLS_thisSlot } = __VLS_141.slots;
            const __VLS_142 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_143 = __VLS_asFunctionalComponent(__VLS_142, new __VLS_142({}));
            const __VLS_144 = __VLS_143({}, ...__VLS_functionalComponentArgsRest(__VLS_143));
            const __VLS_148 = {}.Lock;
            /** @type { [typeof __VLS_components.Lock, ] } */ ;
            // @ts-ignore
            const __VLS_149 = __VLS_asFunctionalComponent(__VLS_148, new __VLS_148({}));
            const __VLS_150 = __VLS_149({}, ...__VLS_functionalComponentArgsRest(__VLS_149));
            __VLS_147.slots.default;
            var __VLS_147;
        }
        var __VLS_141;
        __VLS_135.slots.default;
        var __VLS_135;
        const __VLS_154 = {}.ElFormItem;
        /** @type { [typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, typeof __VLS_components.ElFormItem, typeof __VLS_components.elFormItem, ] } */ ;
        // @ts-ignore
        const __VLS_155 = __VLS_asFunctionalComponent(__VLS_154, new __VLS_154({
            prop: ("password_repeat"),
        }));
        const __VLS_156 = __VLS_155({
            prop: ("password_repeat"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_155));
        const __VLS_160 = {}.ElInput;
        /** @type { [typeof __VLS_components.ElInput, typeof __VLS_components.elInput, typeof __VLS_components.ElInput, typeof __VLS_components.elInput, ] } */ ;
        // @ts-ignore
        const __VLS_161 = __VLS_asFunctionalComponent(__VLS_160, new __VLS_160({
            modelValue: ((__VLS_ctx.form.password_repeat)),
            maxlength: ((16)),
            type: ("password"),
            placeholder: ("重复新密码"),
        }));
        const __VLS_162 = __VLS_161({
            modelValue: ((__VLS_ctx.form.password_repeat)),
            maxlength: ((16)),
            type: ("password"),
            placeholder: ("重复新密码"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_161));
        __VLS_elementAsFunction(__VLS_intrinsicElements.template, __VLS_intrinsicElements.template)({});
        {
            const { prefix: __VLS_thisSlot } = __VLS_165.slots;
            const __VLS_166 = {}.ElIcon;
            /** @type { [typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, typeof __VLS_components.ElIcon, typeof __VLS_components.elIcon, ] } */ ;
            // @ts-ignore
            const __VLS_167 = __VLS_asFunctionalComponent(__VLS_166, new __VLS_166({}));
            const __VLS_168 = __VLS_167({}, ...__VLS_functionalComponentArgsRest(__VLS_167));
            const __VLS_172 = {}.Lock;
            /** @type { [typeof __VLS_components.Lock, ] } */ ;
            // @ts-ignore
            const __VLS_173 = __VLS_asFunctionalComponent(__VLS_172, new __VLS_172({}));
            const __VLS_174 = __VLS_173({}, ...__VLS_functionalComponentArgsRest(__VLS_173));
            __VLS_171.slots.default;
            var __VLS_171;
        }
        var __VLS_165;
        __VLS_159.slots.default;
        var __VLS_159;
        __VLS_126.slots.default;
        var __VLS_126;
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ style: ({}) },
        });
        const __VLS_178 = {}.ElButton;
        /** @type { [typeof __VLS_components.ElButton, typeof __VLS_components.elButton, typeof __VLS_components.ElButton, typeof __VLS_components.elButton, ] } */ ;
        // @ts-ignore
        const __VLS_179 = __VLS_asFunctionalComponent(__VLS_178, new __VLS_178({
            ...{ 'onClick': {} },
            ...{ style: ({}) },
            type: ("danger"),
            plain: (true),
        }));
        const __VLS_180 = __VLS_179({
            ...{ 'onClick': {} },
            ...{ style: ({}) },
            type: ("danger"),
            plain: (true),
        }, ...__VLS_functionalComponentArgsRest(__VLS_179));
        let __VLS_184;
        const __VLS_185 = {
            onClick: (...[$event]) => {
                if (!((__VLS_ctx.active === 1)))
                    return;
                __VLS_ctx.doReset();
            }
        };
        let __VLS_181;
        let __VLS_182;
        __VLS_183.slots.default;
        var __VLS_183;
    }
    __VLS_120.slots.default;
    var __VLS_120;
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {
        'formRef': __VLS_127,
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
            active: active,
            form: form,
            rules: rules,
            formRef: formRef,
            isEmailValid: isEmailValid,
            coldTime: coldTime,
            onValidate: onValidate,
            validateEmail: validateEmail,
            confirmReset: confirmReset,
            doReset: doReset,
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
