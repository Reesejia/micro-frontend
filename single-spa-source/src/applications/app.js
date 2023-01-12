import { reroute } from "../navigations/reroute";
import {
  BOOTSTRAPPING,
  LOADING_SOURCE_CODE,
  MOUNTED,
  NOT_BOOTSTRAPED,
  NOT_LOADED,
  NOT_MOUNTED,
  shouldBeActive,
  SKIP_BECAUSE_BROKEN,
} from "./app-helpers";

// 维护应用的的所有状态
const apps = []; // 用来存放所有的应用
/**
 * 注册应用,将应用放到数组里面存好了
 * @param {*} appName 应用名
 * @param {*} loadApp 加载应用
 * @param {*} activeWhen 当激活会调用loadApp
 * @param {*} customProps 自定义属性
 */
export function registerApplication(appName, loadApp, activeWhen, customProps) {
  apps.push({
    name: appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED,
  });
  // 状态机, 维护应用注册/挂载/销毁的一系列状态
  reroute(); // 加载应用
}

export function getAppChanges() {
  // 要卸载的app
  const appsToUnmount = [];
  // 要加载的app
  const appsToLoad = [];
  // 要挂载的app
  const appsToMount = [];
  apps.forEach((app) => {
    const appShouldBeActive = shouldBeActive(app);
    switch (app.status) {
      // 是否需要被加载
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }
        break;
      case NOT_BOOTSTRAPED:
      case NOT_MOUNTED:
      case BOOTSTRAPPING:
        // 需要被挂载
        if (appShouldBeActive) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED:
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
        break;
    }
  });
  return {
    appsToUnmount,
    appsToLoad,
    appsToMount,
  };
}
