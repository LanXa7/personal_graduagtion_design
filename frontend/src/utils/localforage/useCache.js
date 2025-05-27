import { localForage } from "@/utils/localforage/index";
export const CACHE_KEY = {
    DICT_CACHE: "dictCache"
};
export const useCache = () => {
    const lfCache = localForage();
    return {
        lfCache
    };
};
