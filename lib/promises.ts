/*
    Prevents unhandled promise rejections from being thrown.
    Follows https://jakearchibald.com/2023/unhandled-rejections
*/
export function preventUnhandledRejections(...promises: Promise<unknown>[]) {
  for (const promise of promises) promise.catch(() => {});
}
