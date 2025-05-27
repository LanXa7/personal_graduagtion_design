import { createAlova } from 'alova';
import fetchAdapter from 'alova/fetch';
import vueHook from 'alova/vue';
import { createApis, withConfigType } from './createApis';
import { takeAccessToken } from "@/utils/auth";
import { ElMessage } from "element-plus";
export const alovaInstance = createAlova({
    baseURL: '/api',
    statesHook: vueHook,
    requestAdapter: fetchAdapter(),
    cacheFor: null,
    beforeRequest: method => {
        const whiteList = [
            "sign_in",
            "sign_up",
            "code",
            "confirm",
            "/auth/password",
            "dict",
        ];
        let isAuth = whiteList.some(url => method.url.endsWith(url));
        if (!isAuth) {
            const token = takeAccessToken()?.token;
            method.config.headers['Authorization'] = `Bearer ${token}`;
        }
    },
    responded: {
        onSuccess: async (response, method) => {
            const whiteList = [
                "code",
            ];
            let isWhite = whiteList.some(url => method.url.endsWith(url));
            if (isWhite) {
                if (!response.ok) {
                    const data = await response.json();
                    ElMessage.error(data.detail);
                }
                return response;
            }
            if (!response.ok) {
                const data = await response.json();
                ElMessage.error(data.detail);
                throw new Error(`error code ===> ${data.code}`);
            }
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.split(';')[0] === 'text/plain') {
                return await response.text();
            }
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return response;
        },
        onError: error => {
            ElMessage.error("system error");
            throw error;
        }
    }
});
export const $$userConfigMap = withConfigType({});
const Apis = createApis(alovaInstance, $$userConfigMap);
export default Apis;
