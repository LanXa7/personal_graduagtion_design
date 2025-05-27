import { computed, defineProps } from 'vue';
import { formatBeiJingTime, formatChineseTime } from '@/utils/dateUtils';
const props = defineProps({
    // 时间值，可以是日期对象、时间戳或日期字符串
    time: {
        type: [Date, Number, String],
        required: true
    },
    // 格式化模式
    format: {
        type: String,
        default: 'YYYY-MM-DD HH:mm:ss'
    },
    // 是否使用中文格式（年月日）
    chinese: {
        type: Boolean,
        default: false
    }
});
// 计算格式化后的时间
const formattedTime = computed(() => {
    if (!props.time)
        return '';
    return props.chinese
        ? formatChineseTime(props.time)
        : formatBeiJingTime(props.time, props.format);
});
; /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({});
    (__VLS_ctx.formattedTime);
    var __VLS_slots;
    var $slots;
    let __VLS_inheritedAttrs;
    var $attrs;
    const __VLS_refs = {};
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
            formattedTime: formattedTime,
        };
    },
    props: {
        // 时间值，可以是日期对象、时间戳或日期字符串
        time: {
            type: [Date, Number, String],
            required: true
        },
        // 格式化模式
        format: {
            type: String,
            default: 'YYYY-MM-DD HH:mm:ss'
        },
        // 是否使用中文格式（年月日）
        chinese: {
            type: Boolean,
            default: false
        }
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    props: {
        // 时间值，可以是日期对象、时间戳或日期字符串
        time: {
            type: [Date, Number, String],
            required: true
        },
        // 格式化模式
        format: {
            type: String,
            default: 'YYYY-MM-DD HH:mm:ss'
        },
        // 是否使用中文格式（年月日）
        chinese: {
            type: Boolean,
            default: false
        }
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
