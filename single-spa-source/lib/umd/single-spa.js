(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.singleSpa = {}));
})(this, (function (exports) { 'use strict';

  let started = false;
  function start() {
    started = true;
    // 需要挂载应用
    reroute(); // 除了加载应用,还需要挂载
  }

  // 描述应用的整个状态

  const NOT_LOADED = "NOT_LOADED"; // 初始状态
  const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // loadApp 加载资源
  const NOT_BOOTSTRAPED = "NOT_BOOTSTRAPED"; // 应用还没启动,没有调用bootstrap方法
  const BOOTSTRAPPING = "BOOTSTRAPPING"; // 启动中
  const NOT_MOUNTED = "NOT_MOUNTED"; // 没有挂载,没有调用mounted方法
  const MOUNTING = "MOUNTING"; // 挂载中
  const MOUNTED = "MOUNTED"; // 挂载完毕
  const UNMOUNTING = "UNMOUNTING"; // 解除挂载中

  // 当前应用是否要被激活
  function shouldBeActive(app) {
    // 在要被激活的时候才走LOADING_SOURCE_CODE/MOUNTING...
    // 如果返回true,就应该进行初始化一系列操作
    return app.activeWhen(window.location);
  }

  // 将数组拍平为一个函数,多个方法compose成一个函数,通过promise链来链式调用
  function flattenFnArray(fns) {
    fns = Array.isArray(fns) ? fns : [fns];
    return (props) =>
      fns.reduce((p, fn) => p.then(() => fn(props)), Promise.resolve());
    // 先传入一个默认的promise,之后将传入的promise链在一起
    // Promise.resolve()
    //   .then(() => fn1(props))
    //   .then(() => fn2(props));
  }

  async function toLoadPromise(app) {
    // 缓存机制
    // 如果当前正在加载,直接返回, 保证loadApp不是重复调用
    if (app.loadPromise) {
      return app.loadPromise;
    }
    // 做一层缓存,值得学习!!!
    return (app.loadPromise = Promise.resolve().then(async () => {
      app.status = LOADING_SOURCE_CODE;
      const { bootstrap, mount, unmount } = await app.loadApp(app.customProps);
      app.status = NOT_BOOTSTRAPED; // 没有调用bootstrap方法
      // 希望将多个promise组合成一起,compose

      app.bootstrap = flattenFnArray(bootstrap);
      app.mount = flattenFnArray(mount);
      app.unmount = flattenFnArray(unmount);
      // 加载完删除这个loadPromise属性
      delete app.loadPromise;
      return app;
    }));
  }

  async function toUnmountPromise(app) {
    // 当前应用没有被挂载直接什么都不做了
    if (app.status != MOUNTED) {
      return app;
    }
    app.status = UNMOUNTING;
    app.unmount(app.customProps);
    app.status = NOT_MOUNTED;
    return app;
  }

  async function toBootstrapPromise(app) {
    if (app.status !== NOT_BOOTSTRAPED) {
      // 还不具备启动条件
      return app;
    }
    app.status = BOOTSTRAPPING;
    await app.bootstrap(app.customProps);
    app.status = NOT_MOUNTED;
    return app;
  }

  async function toMountPromise(app) {
    if (app.status !== NOT_MOUNTED) {
      // 还不具备挂载条件
      return app;
    }
    app.status = MOUNTING;
    await app.mount(app.customProps);
    app.status = MOUNTED;
    return app;
  }

  // hashChange

  const routingEventsListeningTo = ["hashChange", "popstate"];

  function urlReroute() {
    // 会根据路径重新加载不同的应用
    reroute();
  }

  const capturedEventListeners = {
    // 后续挂载的事件先暂存起来
    hashChange: [],
    popstate: [], // 当应用切换完成后可以调用
  };

  // 我们处理应用加载的逻辑是在最前面
  window.addEventListener("hashchange", urlReroute);
  window.addEventListener("popstate", urlReroute);

  const originalAddEventListner = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;

  window.addEventListener = function (eventName, fn) {
    if (
      routingEventsListeningTo.indexOf(eventName) >= 0 &&
      !capturedEventListeners[eventName].some((listener) => listener == fn)
    ) {
      capturedEventListeners[eventName].push(fn);
      console.log("capturedEventListeners", capturedEventListeners);
      return;
    }
    // 如果不在这里面缓存过,调用原有的
    return originalAddEventListner.apply(this, arguments); // this -> window
  };

  window.removeEventListener = function (eventName, fn) {
    if (routingEventsListeningTo.indexOf(eventName) >= 0) {
      capturedEventListeners[eventName] = capturedEventListeners[
        eventName
      ].filter((l) => l !== fn);
      return;
    }
    return originalRemoveEventListener.apply(this, arguments); // this -> window
  };

  // 如果是hash路由,hash变化时可以切换
  // 浏览器路由,是基于h5 api的,如果用h5 api切换时不会触发popstate

  function patchedUpdateState(updateState, methodName) {
    return function () {
      const urlBefore = window.location.href;
      updateState.apply(this, arguments); // 调用切换方法
      const urlAfter = window.location.href;
      if (urlBefore !== urlAfter) {
        // 重新加载应用,传入构建PopStateEvent 事件源
        urlReroute(new PopStateEvent("popstate"));
      }
    };
  }

  window.history.pushState = patchedUpdateState(
    window.history.pushState);

  window.history.pushState = patchedUpdateState(
    window.history.replaceState);

  // 用户可能还会绑定自己的路由事件 vue绑定自己的

  // 当我们应用切换后还需要处理原来的方法,需要在应用切换后再执行

  // 核心应用处理
  function reroute() {
    // 需要获取 要加载的应用
    // 需要获取 要被挂载的应用
    // 哪些应用需要被卸载
    const { appsToUnmount, appsToLoad, appsToMount } = getAppChanges();
    // console.log("appsToLoad", appsToLoad);
    // console.log("appsToMount", appsToMount);
    // console.log("appsToUnmount", appsToUnmount);

    // start方法调用时同步的,但是加载流程是异步的
    if (started) {
      // app装载
      // console.log("调用start方法");
      return performAppChanges(); // 根据路径来装载应用
    } else {
      // 注册应用时,需要预先加载
      // console.log("调用register方法");
      return loadApps(); // 预加载应用
    }

    // 预加载 异步的
    async function loadApps() {
      // 预加载就是获取到bootstrap/mount/unmount方法到app上
      let apps = await Promise.all(appsToLoad.map(toLoadPromise));
      console.log("apps", apps);
    }

    // 根据路径来装载应用
    async function performAppChanges() {
      // 先卸载不需要的应用
      // 这里没加await,表示可以在装载的同时去并发卸载另一个
      appsToUnmount.map(toUnmountPromise);

      // 去加载需要的应用
      // 这个应用需要去加载,但是路径不匹配, 加载app1的时候,这时候切换到了app2了
      appsToLoad.map(async (app) => {
        // 将需要去加载的应用拿到,依次 加载/启动/挂载
        app = await toLoadPromise(app);
        app = await toBootstrapPromise(app);
        return toMountPromise(app);
      });

      // 可能在调用start的时候已经加载完毕了,由于状态的限制上面的函数已经执行不进去了
      // 这里需要直接走启动和挂载
      appsToMount.map(async (app) => {
        app = await toBootstrapPromise(app);
        return toMountPromise(app);
      });
    }
  }

  // 这个流程是初始化操作的,还需要当路径切换时重新加载应用
  // 重写路由相关的方法

  // 维护应用的的所有状态
  const apps = []; // 用来存放所有的应用
  /**
   * 注册应用,将应用放到数组里面存好了
   * @param {*} appName 应用名
   * @param {*} loadApp 加载应用
   * @param {*} activeWhen 当激活会调用loadApp
   * @param {*} customProps 自定义属性
   */
  function registerApplication(appName, loadApp, activeWhen, customProps) {
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

  function getAppChanges() {
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

  exports.registerApplication = registerApplication;
  exports.start = start;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=single-spa.js.map
