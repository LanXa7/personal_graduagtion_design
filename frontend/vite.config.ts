import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from "unplugin-vue-components/resolvers";
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        AutoImport({
            resolvers: [ElementPlusResolver()],
        }),
        Components({
            resolvers: [ElementPlusResolver()],
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        },
    },
    // server: {
    //     proxy: {
    //         '/api': {
    //             target: 'http://localhost:8085', // 后端服务器地址
    //             changeOrigin: true, // 修改 Origin 头
    //             rewrite: (path: string) => path.replace(/^\/api/, ""), // 去掉 /api 前缀
    //         },
    //     },
    // },
})


