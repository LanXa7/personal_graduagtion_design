import forage from "localforage";
class StorageProxy {
    storage;
    constructor(storageModel) {
        this.storage = storageModel;
        this.storage.config({
            // 首选IndexedDB作为第一驱动，不支持IndexedDB会自动降级到localStorage（WebSQL被弃用，详情看https://developer.chrome.com/blog/deprecating-web-sql）
            driver: [this.storage.INDEXEDDB, this.storage.LOCALSTORAGE],
            name: "graduation_design"
        });
    }
    /**
     * @description 将对应键名的数据保存到离线仓库
     * @param k 键名
     * @param v 键值
     * @param m 缓存时间（单位`分`，默认`0`分钟，永久缓存）
     */
    async setItem(k, v, m = 0) {
        return new Promise((resolve, reject) => {
            this.storage
                .setItem(k, {
                data: v,
                expires: m ? new Date().getTime() + m * 60 * 1000 : 0
            })
                .then(value => {
                resolve(value.data);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**
     * @description 从离线仓库中获取对应键名的值
     * @param k 键名
     */
    async getItem(k) {
        return new Promise((resolve, reject) => {
            this.storage
                .getItem(k)
                .then((value) => {
                value && (value.expires > new Date().getTime() || value.expires === 0)
                    ? resolve(value.data)
                    : resolve(null);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**
     * @description 从离线仓库中删除对应键名的值
     * @param k 键名
     */
    async removeItem(k) {
        return new Promise((resolve, reject) => {
            this.storage
                .removeItem(k)
                .then(() => {
                resolve();
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**
     * @description 从离线仓库中删除所有的键名，重置数据库
     */
    async clear() {
        return new Promise((resolve, reject) => {
            this.storage
                .clear()
                .then(() => {
                resolve();
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    /**
     * @description 获取数据仓库中所有的key
     */
    async keys() {
        return new Promise((resolve, reject) => {
            this.storage
                .keys()
                .then(keys => {
                resolve(keys);
            })
                .catch(err => {
                reject(err);
            });
        });
    }
}
/**
 * 二次封装 [localforage](https://localforage.docschina.org/) 支持设置过期时间，提供完整的类型提示
 */
export const localForage = () => new StorageProxy(forage);
