import { WebClient } from "@slack/web-api";

/**
 * Convert all null in an object values to undefined,
 * and remove the null type from the object keys
 */
export function nullKeysToUndefined<T extends Record<string, any>>(
  obj: T,
): { [K in keyof T]: Exclude<T[K], null> } {
  return typedObjectKeys(obj).reduce(
    (acc, key) => {
      if (obj[key] === null) {
        // @ts-expect-error yes this is what we want
        acc[key] = undefined;
      } else {
        acc[key] = obj[key];
      }
      return acc;
    },
    {} as { [K in keyof T]: Exclude<T[K], null> },
  );
}

/**
 * Object.keys but preserves the type of the keys
 */
export function typedObjectKeys<T extends object>(object: T) {
  return Object.keys(object) as (keyof typeof object)[];
}

export async function isTokenValid(token?: string) {
  if (!token) return false;
  try {
    const client = new WebClient(token);
    await client.auth.test();
    return true;
  } catch (error) {
    return false;
  }
}
