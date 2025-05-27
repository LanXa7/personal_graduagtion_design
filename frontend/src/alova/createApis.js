import { Method } from 'alova';
import apiDefinitions from './apiDefinitions';
const createFunctionalProxy = (array, alovaInstance, configMap) => {
    // create a new proxy instance
    return new Proxy(function () { }, {
        get(_, property) {
            // record the target property, so that it can get the completed accessing paths
            array.push(property);
            // always return a new proxy to continue recording accessing paths.
            return createFunctionalProxy(array, alovaInstance, configMap);
        },
        apply(_, __, [config]) {
            const apiPathKey = array.join('.');
            const apiItem = apiDefinitions[apiPathKey];
            if (!apiItem) {
                throw new Error(`the api path of \`${apiPathKey}\` is not found`);
            }
            const mergedConfig = {
                ...configMap[apiPathKey],
                ...config
            };
            const [method, url] = apiItem;
            const pathParams = mergedConfig.pathParams;
            const urlReplaced = url.replace(/\{([^}]+)\}/g, (_, key) => {
                const pathParam = pathParams[key];
                return pathParam;
            });
            delete mergedConfig.pathParams;
            let data = mergedConfig.data;
            if (Object.prototype.toString.call(data) === '[object Object]' && typeof FormData !== 'undefined') {
                let hasBlobData = false;
                const formData = new FormData();
                for (const key in data) {
                    formData.append(key, data[key]);
                    if (data[key] instanceof Blob) {
                        hasBlobData = true;
                    }
                }
                data = hasBlobData ? formData : data;
            }
            return new Method(method.toUpperCase(), alovaInstance, urlReplaced, mergedConfig, data);
        }
    });
};
export const createApis = (alovaInstance, configMap) => {
    const Apis = new Proxy({}, {
        get(_, property) {
            return createFunctionalProxy([property], alovaInstance, configMap);
        }
    });
    // define global variable `Apis`
    globalThis.Apis = Apis;
    return Apis;
};
export const withConfigType = (config) => config;
