import dayjs from 'dayjs';
import router from "@/router";
import { ElMessage } from "element-plus";
const authItemName = "authorize";
const accessHeader = () => {
    return {
        'Authorization': `Bearer ${takeAccessToken()?.token}`
    };
};
function takeAccessToken() {
    const str = localStorage.getItem(authItemName) || sessionStorage.getItem(authItemName);
    if (!str)
        return null;
    const authObj = JSON.parse(str);
    if (dayjs().isAfter(authObj.expire)) {
        deleteAccessToken();
        ElMessage.warning("登录状态已过期，请重新登录！");
        return null;
    }
    return authObj;
}
function storeAccessToken(remember, token, expire, roles) {
    const authObj = {
        token: token,
        expire: expire.format('YYYY-MM-DD HH:mm:ss'),
        roles: roles
    };
    const str = JSON.stringify(authObj);
    if (remember)
        localStorage.setItem(authItemName, str);
    else
        sessionStorage.setItem(authItemName, str);
}
function refreshToken(token, expire, roles) {
    const authObj = {
        token: token,
        expire: expire.format('YYYY-MM-DD HH:mm:ss'),
        roles: roles
    };
    const str = JSON.stringify(authObj);
    sessionStorage.setItem(authItemName, str);
}
function deleteAccessToken(redirect = false) {
    localStorage.removeItem(authItemName);
    sessionStorage.removeItem(authItemName);
    if (redirect) {
        router.push({ name: 'welcome-login' });
    }
}
function unauthorized() {
    return !takeAccessToken();
}
export { takeAccessToken, unauthorized, storeAccessToken, deleteAccessToken, accessHeader };
