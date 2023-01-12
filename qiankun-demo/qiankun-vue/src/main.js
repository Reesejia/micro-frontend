import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false
let instance = null
function render(props) {
  new Vue({
    router,
    // store, // 可以将props直接挂载到store中进行主子应用的通信
    render: (h) => h(App),
  }).$mount('#app') // 这里是挂载到自己的html中, 基座会拿到这个挂载后端html,将其插入进去
}

// window.__QIANKUN_DEVELOPMENT__
// window.__POWERED_BY_QIANKUN__
// window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
if (window.__POWERED_BY_QIANKUN__) {
  console.log(
    'window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__',
    window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__,
  )
  console.log('window.__POWERED_BY_QIANKUN__', window.__POWERED_BY_QIANKUN__)
  console.log('window.__QIANKUN_DEVELOPMENT__', window.__QIANKUN_DEVELOPMENT__)
  // 如果是qiankun使用, 会添加动态注入publicPath
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__
}
if (!window.__POWERED_BY_QIANKUN__) {
  // 独立运行
  instance = render()
}

// 设置子组件的协议
// 必须导出promise的bootstrap/mount/unmount方法,可以不写具体内容,但是得有,内部会校验这些方法存在与否
export async function bootstrap(props) {}
export async function mount(props) {
  console.log('props', props)
  // 发布订阅
  // onGlobalStateChange()
  // setGlobalState()
  render(props)
}
export async function unmount(props) {
  instance && instance.$destroy()
}
