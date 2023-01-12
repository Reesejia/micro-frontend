import { MOUNTED, MOUNTING, NOT_MOUNTED } from "../applications/app-helpers";

export async function toMountPromise(app) {
  if (app.status !== NOT_MOUNTED) {
    // 还不具备挂载条件
    return app;
  }
  app.status = MOUNTING;
  await app.mount(app.customProps);
  app.status = MOUNTED;
  return app;
}
