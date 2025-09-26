import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import zhCn from "element-plus/es/locale/lang/zh-cn";

import "./index.scss";

const app = createApp(App);
const pinia = createPinia();
app.use(ElementPlus, { locale: zhCn });
// 注册Pinia
app.use(pinia);

// 注册路由
app.use(router);

// 通过app实例提供router
app.provide("router", router);

app.mount("#root");
