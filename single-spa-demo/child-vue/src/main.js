import Vue from 'vue'
import App from './App.vue'
import router from './router'
import singleSpaVue from 'single-spa-vue'

Vue.config.productionTip = false

const appOptions = {
  el: '#vue', // 将这个应用挂载的父应用的哪个标签中
  router,
  render: (h) => h(App),
}
const vueLifeCycle = singleSpaVue({
  Vue,
  appOptions,
})

// 如果是父应用引用我
if (window.singleSpaNavigate) {
  // webpack 打包的时候加上目录
  // 保证子应用加载资源是相对自己,不是相对父应用
  __webpack_public_path__ = 'http://localhost:10000/'
}
if (!window.window.singleSpaNavigate) {
  delete appOptions.el
  new Vue(appOptions).$mount('#app')
}
// 协议接入 父应用会调用这些方法
export const bootstrap = vueLifeCycle.bootstrap
export const mount = vueLifeCycle.mount
export const unmount = vueLifeCycle.unmount
