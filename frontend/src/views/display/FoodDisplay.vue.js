import { ref, onMounted } from 'vue';
import Apis from '@/alova';
const recommendationData = ref({});
const fetchData = async () => {
    try {
        const response = await Apis.FoodController.recommendation();
        recommendationData.value = response;
    }
    catch (error) {
        console.error('获取菜品数据失败:', error);
    }
};
onMounted(() => {
    fetchData();
}); /* PartiallyEnd: #3632/scriptSetup.vue */
function __VLS_template() {
    const __VLS_ctx = {};
    let __VLS_components;
    let __VLS_directives;
    ['food-card', 'food-image',];
    // CSS variable injection 
    // CSS variable injection end 
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("food-display") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("food-cards") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("category-section") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("category-title") },
    });
    const __VLS_0 = {}.ElCarousel;
    /** @type { [typeof __VLS_components.ElCarousel, typeof __VLS_components.elCarousel, typeof __VLS_components.ElCarousel, typeof __VLS_components.elCarousel, ] } */ ;
    // @ts-ignore
    const __VLS_1 = __VLS_asFunctionalComponent(__VLS_0, new __VLS_0({
        interval: ((4000)),
        type: ("card"),
        height: ("400px"),
        ...{ class: ("carousel") },
    }));
    const __VLS_2 = __VLS_1({
        interval: ((4000)),
        type: ("card"),
        height: ("400px"),
        ...{ class: ("carousel") },
    }, ...__VLS_functionalComponentArgsRest(__VLS_1));
    for (const [food] of __VLS_getVForSourceType((__VLS_ctx.recommendationData.recommendation))) {
        const __VLS_6 = {}.ElCarouselItem;
        /** @type { [typeof __VLS_components.ElCarouselItem, typeof __VLS_components.elCarouselItem, typeof __VLS_components.ElCarouselItem, typeof __VLS_components.elCarouselItem, ] } */ ;
        // @ts-ignore
        const __VLS_7 = __VLS_asFunctionalComponent(__VLS_6, new __VLS_6({
            key: ((food.id)),
        }));
        const __VLS_8 = __VLS_7({
            key: ((food.id)),
        }, ...__VLS_functionalComponentArgsRest(__VLS_7));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("carousel-content") },
        });
        const __VLS_12 = {}.ElImage;
        /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */ ;
        // @ts-ignore
        const __VLS_13 = __VLS_asFunctionalComponent(__VLS_12, new __VLS_12({
            src: ((food.picture ? `/api/images${food.picture}` : '')),
            ...{ class: ("carousel-image") },
            fit: ("cover"),
        }));
        const __VLS_14 = __VLS_13({
            src: ((food.picture ? `/api/images${food.picture}` : '')),
            ...{ class: ("carousel-image") },
            fit: ("cover"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_13));
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("carousel-info") },
        });
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("carousel-name") },
        });
        (food.name);
        __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
            ...{ class: ("carousel-price") },
        });
        (food.price);
        __VLS_11.slots.default;
        var __VLS_11;
    }
    __VLS_5.slots.default;
    var __VLS_5;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("food-cards") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
        ...{ class: ("category-section") },
    });
    __VLS_elementAsFunction(__VLS_intrinsicElements.h2, __VLS_intrinsicElements.h2)({
        ...{ class: ("category-title") },
    });
    if (__VLS_ctx.recommendationData.leftoverFood && __VLS_ctx.recommendationData.leftoverFood.length > 0) {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("cards-container") },
        });
        for (const [food] of __VLS_getVForSourceType((__VLS_ctx.recommendationData.leftoverFood))) {
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                key: ((food.id)),
                ...{ class: ("food-card") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("food-image") },
            });
            const __VLS_18 = {}.ElImage;
            /** @type { [typeof __VLS_components.ElImage, typeof __VLS_components.elImage, ] } */ ;
            // @ts-ignore
            const __VLS_19 = __VLS_asFunctionalComponent(__VLS_18, new __VLS_18({
                src: ((food.picture ? `/api/images${food.picture}` : '')),
                ...{ class: ("food-image") },
                fit: ("cover"),
            }));
            const __VLS_20 = __VLS_19({
                src: ((food.picture ? `/api/images${food.picture}` : '')),
                ...{ class: ("food-image") },
                fit: ("cover"),
            }, ...__VLS_functionalComponentArgsRest(__VLS_19));
            __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
                ...{ class: ("food-info") },
            });
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("food-name") },
            });
            (food.name);
            __VLS_elementAsFunction(__VLS_intrinsicElements.span, __VLS_intrinsicElements.span)({
                ...{ class: ("food-price") },
            });
            (food.price);
        }
    }
    else {
        __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({
            ...{ class: ("empty-tip") },
        });
        const __VLS_24 = {}.ElEmpty;
        /** @type { [typeof __VLS_components.ElEmpty, typeof __VLS_components.elEmpty, ] } */ ;
        // @ts-ignore
        const __VLS_25 = __VLS_asFunctionalComponent(__VLS_24, new __VLS_24({
            description: ("该摊位暂无更多餐品"),
        }));
        const __VLS_26 = __VLS_25({
            description: ("该摊位暂无更多餐品"),
        }, ...__VLS_functionalComponentArgsRest(__VLS_25));
    }
    ['food-display', 'food-cards', 'category-section', 'category-title', 'carousel', 'carousel-content', 'carousel-image', 'carousel-info', 'carousel-name', 'carousel-price', 'food-cards', 'category-section', 'category-title', 'cards-container', 'food-card', 'food-image', 'food-image', 'food-info', 'food-name', 'food-price', 'empty-tip',];
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
            recommendationData: recommendationData,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
    __typeEl: {},
});
; /* PartiallyEnd: #4569/main.vue */
