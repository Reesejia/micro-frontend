import {
  BOOTSTRAPPING,
  NOT_BOOTSTRAPED,
  NOT_MOUNTED,
} from "../applications/app-helpers";

export async function toBootstrapPromise(app) {
  if (app.status !== NOT_BOOTSTRAPED) {
    // 还不具备启动条件
    return app;
  }
  app.status = BOOTSTRAPPING;
  await app.bootstrap(app.customProps);
  app.status = NOT_MOUNTED;
  return app;
}
