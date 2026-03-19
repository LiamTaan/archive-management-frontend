import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 解决wheel事件的passive警告
const originalAddEventListener = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(type, listener, options) {
  if (type === 'wheel' && typeof options !== 'object') {
    options = {
      passive: true,
      capture: options || false
    };
  }
  return originalAddEventListener.call(this, type, listener, options);
};

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus, { 
  locale: zhCn,
  // 全局配置日期选择器格式
  datePicker: {
    format: 'YYYY-MM-DD HH:mm:ss',
    valueFormat: 'YYYY-MM-DD HH:mm:ss'
  }
})
app.use(router)
app.use(store)
app.mount('#app')