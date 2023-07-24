type Cached<T> = {
  [key: string]: T;
};

const cachedObject: Cached<any> = {};

/** Checks if item is in memory and not expired */
export const hasCachedItem = (key: string) => {
  const cached = cachedObject[key];
  if (!cached) return false;
  if (Date.now() - cached.cachedUntil > 0) return false;
  return true;
};

/** Stores item in memory */
export const cacheItem = <T>(
  key: string,
  item: T,
  cacheDuration = 10000,
): T => {
  cachedObject[key] = {
    item,
    cachedUntil: Date.now() + cacheDuration,
  };
  return cachedObject[key].item;
};

/** Returns item stored in memory */
export const getCachedItem = <T>(key: string): T => {
  return cachedObject[key] && cachedObject[key].item;
};
