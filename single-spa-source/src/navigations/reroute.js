import { getAppChanges } from '../applications/app'
import { started } from '../start'
import { toLoadPromise } from '../lifecycles/load'
import { toUnmountPromise } from '../lifecycles/unmount'
import { toBootstrapPromise } from '../lifecycles/bootstrap'
import { toMountPromise } from '../lifecycles/mount'
import './navigator-events'
// 核心应用处理
export function reroute() {
  // 需要获取 要加载、挂载、卸载的应用
  const { appsToUnmount, appsToLoad, appsToMount } = getAppChanges()
  if (started) {
    return performAppChanges() // 根据路径来装载应用
  } else {
    // 注册应用时,需要预先加载
    // console.log("调用register方法");
    return loadApps() // 预加载应用
  }

  // 预加载 异步的
  async function loadApps() {
    // 预加载就是获取到bootstrap/mount/unmount方法到app上
    let apps = await Promise.all(appsToLoad.map(toLoadPromise))
    console.log('apps', apps)
  }

  // 根据路径来装载应用
  async function performAppChanges() {
    let unmountPromises = appsToUnmount.map(toUnmountPromise)
    appsToLoad.map(async (app) => {
      // 将需要去加载的应用拿到,依次 加载/启动/挂载
      app = await toLoadPromise(app)
      app = await toBootstrapPromise(app)
      return toMountPromise(app)
    })

    // 这里需要直接走启动和挂载
    appsToMount.map(async (app) => {
      app = await toBootstrapPromise(app)
      return toMountPromise(app)
    })
  }
}

// 这个流程是初始化操作的,还需要当路径切换时重新加载应用
// 重写路由相关的方法
