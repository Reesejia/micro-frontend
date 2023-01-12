import { MOUNTED, NOT_MOUNTED, UNMOUNTING } from "../applications/app-helpers";

export async function toUnmountPromise(app) {
  // 当前应用没有被挂载直接什么都不做了
  if (app.status != MOUNTED) {
    return app;
  }
  app.status = UNMOUNTING;
  app.unmount(app.customProps);
  app.status = NOT_MOUNTED;
  return app;
}
