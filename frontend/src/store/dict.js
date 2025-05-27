import { createPinia, defineStore } from "pinia";
// @ts-ignore
import { CACHE_KEY, useCache } from "@/utils/localforage/useCache";
const { lfCache } = useCache();
export const useDictStore = defineStore("dict", {
    state: () => ({
        dictMap: new Map(),
        isSetDict: false
    }),
    getters: {
        getDictMap() {
            const dictMap = lfCache.getItem(CACHE_KEY.DICT_CACHE);
            if (dictMap) {
                this.dictMap = dictMap;
            }
            return this.dictMap;
        },
        getIsSetDict() {
            return this.isSetDict;
        }
    },
    actions: {
        async setDictMap() {
            const dictMap = await lfCache.getItem(CACHE_KEY.DICT_CACHE);
            if (dictMap) {
                this.dictMap = dictMap;
                this.isSetDict = true;
            }
            else {
                const data = await Apis.DictController.queryDict();
                // 设置数据
                const dictDataMap = new Map();
                data.forEach((dictData) => {
                    // 获得 dictType 层级
                    const enumValueObj = dictDataMap.get(dictData.dictType);
                    if (!enumValueObj) {
                        dictDataMap.set(dictData.dictType, []);
                    }
                    // 处理 dictValue 层级
                    dictDataMap.get(dictData.dictType).push({
                        value: dictData.value,
                        label: dictData.label
                    });
                });
                this.dictMap = dictDataMap;
                this.isSetDict = true;
                await lfCache.setItem(CACHE_KEY.DICT_CACHE, dictDataMap, 1);
            }
        },
        getDictByType(type) {
            if (!this.isSetDict) {
                this.setDictMap();
            }
            return this.dictMap.get(type);
        },
        async resetDict() {
            await lfCache.removeItem(CACHE_KEY.DICT_CACHE);
            const data = await Apis.DictController.queryDict();
            // 设置数据
            const dictDataMap = new Map();
            data.forEach((dictData) => {
                // 获得 dictType 层级
                const enumValueObj = dictDataMap.get(dictData.dictType);
                if (!enumValueObj) {
                    dictDataMap.set(dictData.dictType, []);
                }
                // 处理 dictValue 层级
                dictDataMap.get(dictData.dictType).push({
                    value: dictData.value,
                    label: dictData.label
                });
            });
            this.dictMap = dictDataMap;
            this.isSetDict = true;
            await lfCache.setItem(CACHE_KEY.DICT_CACHE, dictDataMap, 1);
        }
    }
});
export const useDictStoreWithOut = () => {
    return useDictStore(createPinia());
};
