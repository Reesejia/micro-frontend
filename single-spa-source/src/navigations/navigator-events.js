// hashChange
// popstate

import { reroute } from './reroute'

export const routingEventsListeningTo = ['hashChange', 'popstate']

function urlReroute() {
  // 会根据路径重新加载不同的应用
  reroute([], arguments)
}

const capturedEventListeners = {
  // 后续挂载的事件先暂存起来
  hashChange: [],
  popstate: [], // 当应用切换完成后可以调用
}

window.addEventListener('hashchange', urlReroute)
window.addEventListener('popstate', urlReroute)

const originalAddEventListner = window.addEventListener
const originalRemoveEventListener = window.removeEventListener

window.addEventListener = function (eventName, fn) {
  if (
    routingEventsListeningTo.indexOf(eventName) >= 0 &&
    !capturedEventListeners[eventName].some((listener) => listener == fn)
  ) {
    capturedEventListeners[eventName].push(fn)
    console.log('capturedEventListeners', capturedEventListeners)
    return
  }
  // 如果不在这里面缓存过,调用原有的
  return originalAddEventListner.apply(this, arguments) // this -> window
}

window.removeEventListener = function (eventName, fn) {
  if (routingEventsListeningTo.indexOf(eventName) >= 0) {
    capturedEventListeners[eventName] = capturedEventListeners[
      eventName
    ].filter((l) => l !== fn)
    return
  }
  return originalRemoveEventListener.apply(this, arguments)
}

// 如果是hash路由,hash变化时可以切换
// 浏览器路由,是基于h5 api的,如果用h5 api切换时不会触发popstate

function patchedUpdateState(updateState, methodName) {
  return function () {
    const urlBefore = window.location.href
    updateState.apply(this, arguments) // 调用切换方法
    const urlAfter = window.location.href
    if (urlBefore !== urlAfter) {
      // 重新加载应用,传入构建PopStateEvent 事件源
      urlReroute(new PopStateEvent('popstate'))
    }
  }
}

window.history.pushState = patchedUpdateState(
  window.history.pushState,
  'pushState',
)

window.history.pushState = patchedUpdateState(
  window.history.replaceState,
  'replaceState',
)
