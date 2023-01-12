import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import { registerMicroApps, start } from 'qiankun'
import 'element-ui/lib/theme-chalk/index.css'

const apps = [
  {
    name: 'vueApp', // 名字
    entry: '//localhost:9000', // 默认会加载这个html,解析里面的js,动态执行(由于请求了子应用的资源,子应用需要支持跨域), 内部用的fetch
    container: '#vue', // 容器
    activeRule: '/vue', // 激活路径
    props: {
      a: 1,
    },
  },
  {
    name: 'reactApp',
    entry: '//localhost:9095',
    container: '#react',
    activeRule: '/react',
  },
]

// 注册应用
registerMicroApps(apps, {
  beforeMount() {
    // loading...
  },
  //  beforeLoad?
  //  beforeMount
  //  afterMount?
  //  beforeUnmoun
  //  afterUnmount
})
// 开启
start({
  prefetch: false, // 取消预加载
})
Vue.config.productionTip = false
Vue.use(ElementUI)
new Vue({
  router,
  render: (h) => h(App),
}).$mount('#app')
