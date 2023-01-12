import {
  LOADING_SOURCE_CODE,
  NOT_BOOTSTRAPED,
} from '../applications/app-helpers'

// 将数组拍平为一个函数,多个方法compose成一个函数,通过promise链来链式调用
function flattenFnArray(fns) {
  fns = Array.isArray(fns) ? fns : [fns]
  return (props) =>
    fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve())
}

export async function toLoadPromise(app) {
  // 如果当前正在加载,直接返回, 保证loadApp不是重复调用
  if (app.loadPromise) {
    return app.loadPromise
  }

  return (app.loadPromise = Promise.resolve().then(async () => {
    app.status = LOADING_SOURCE_CODE
    const { bootstrap, mount, unmount } = await app.loadApp(app.customProps)
    app.status = NOT_BOOTSTRAPED // 没有调用bootstrap方法
    // 将多个promise组合成一起
    app.bootstrap = flattenFnArray(bootstrap)
    app.mount = flattenFnArray(mount)
    app.unmount = flattenFnArray(unmount)
    // 加载完删除这个loadPromise属性
    delete app.loadPromise
    return app
  }))
}
