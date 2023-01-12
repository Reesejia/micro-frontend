// 描述应用的整个状态
export const NOT_LOADED = 'NOT_LOADED' // 初始状态
export const LOADING_SOURCE_CODE = 'LOADING_SOURCE_CODE' // loadApp 加载资源
export const NOT_BOOTSTRAPED = 'NOT_BOOTSTRAPED' // 应用还没启动,没有调用bootstrap方法
export const BOOTSTRAPPING = 'BOOTSTRAPPING' // 启动中
export const NOT_MOUNTED = 'NOT_MOUNTED' // 没有挂载,没有调用mounted方法
export const MOUNTING = 'MOUNTING' // 挂载中
export const MOUNTED = 'MOUNTED' // 挂载完毕
export const UPDATING = 'UPDATING' // 更新中
export const UNMOUNTING = 'UNMOUNTING' // 解除挂载中
export const UNLOADING = 'UNLOADING' // 完全卸载中
export const LOADERR = 'LOADERR' // 加载失败
export const SKIP_BECAUSE_BROKEN = 'SKIP_BECAUSE_BROKEN' // 代码出错

// 当前应用是否已经被激活
export function isActive(app) {
  return app.status === MOUNTED
}

// 当前应用是否要被激活
export function shouldBeActive(app) {
  // 在要被激活的时候才走LOADING_SOURCE_CODE/MOUNTING...
  // 如果返回true,就应该进行初始化一系列操作
  return app.activeWhen(window.location)
}
