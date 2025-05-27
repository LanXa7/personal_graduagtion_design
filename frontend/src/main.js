import { createApp } from 'vue';
import './style/tailwind.css';
import App from './App.vue';
import router from './router';
import './alova/index';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { formatBeiJingTime, formatChineseTime } from './utils/dateUtils';
const pinia = createPinia();
const app = createApp(App);
// 添加全局属性用于时间格式化
app.config.globalProperties.$formatDate = formatBeiJingTime;
app.config.globalProperties.$formatChineseDate = formatChineseTime;
app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.mount('#app');
