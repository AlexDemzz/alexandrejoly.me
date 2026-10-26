/** Resolves with `ms` once that long has passed, standing in for a slow
network in the demos. */
export const wait = (ms: number) => {
  const { promise, resolve } = Promise.withResolvers<number>();
  window.setTimeout(() => resolve(ms), ms);
  return promise;
};
