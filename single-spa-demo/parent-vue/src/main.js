import Vue from 'vue'
import App from './App.vue'
import router from './router'
import { registerApplication, start } from 'single-spa'
Vue.config.productionTip = false

async function loadScript(url) {
  return new Promise((resolve, reject) => {
    let script = document.createElement('script')
    script.src = url
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

/**
 * myVueApp: 加载子应用的名字,自定义的
 * applicationOrLoadingFn: 是个promise函数,或者返回一个promise
 */
registerApplication(
  'myVueApp',
  async () => {
    //把这个引入进来, 这里的ip需要换成自己的ip
    await loadScript('http://localhost:10000/js/chunk-vendors.js')
    await loadScript('http://localhost:10000/js/app.js')
    console.log('加载模块')
    return window.singleVue
  },
  (location) => location.pathname.startsWith('/vue'),
  // 用户切换到/vue的路径下,需要加载刚才定义的子应用
  {
    test: 1,
  },
)
start()
new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
