/**
 * Type helpers and tranformations for common use cases.
 *
 */

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
 * Object.keys, but preserves the type of the keys
 */
export function typedObjectKeys<T extends object>(obj: T) {
  return Object.keys(obj) as (keyof typeof obj)[];
}

/**
 * Helper to make sure all cases of an union or enum are handled, for `switch` statements or `if` statements.
 *
 * If a case is not handled, a type-check will fail the build, and a runtime error will be thrown if the build passes somehow.
 *
 * Example usage:
 *  const statuses = ['init', 'pending', 'success', 'error'] as const;
 *  type Status = typeof statuses[number];
 *
 *  function handleStatus(status: Status) {
 *    switch (status) {
 *      case 'init': return 'Pending';
 *      case 'success': return 'Success';
 *      case 'error': return 'Error';
 *      default: throwUnhandledCase(status); // will show a type error because 'pending' is not handled
 *    }
 *  }
 */
export function throwUnhandledCase(caseValue: never, additionalInfo?: string) {
  console.error(`Unhandled case: ${caseValue} ${additionalInfo ?? ""}`);
  throw new Error(`Unhandled case: ${caseValue} ${additionalInfo ?? ""}`);
}

/**
 * Transforms a form values schema into an initial form values object, to allow setting invalid initial values (basically empty strings).
 *
 * usage with react-hook-form typings:
 *   const form = useForm<InitialFormValues<UserSchema>, void, UserSchema>( defaultValues: {...})
 */
export type InitialFormValues<FormValues> = {
  [Key in keyof FormValues]: TransformedFormValue<FormValues[Key]>;
};

type TransformedFormValue<FormValue> = FormValue extends Array<infer Item>
  ? InitialArrayValues<Item>
  : FormValue extends object
  ? InitialFormValues<FormValue>
  : FormValue | string;

interface InitialArrayValues<Values> extends Array<InitialFormValues<Values>> {}

/**
 * Type assertion and comparison helpers for additional build-time checks. (Better fail the build than have a runtime error.)
 *
 * Example usages:
 *
 *  - make sure that an array contains all the keys of an object:
 *      const obj = { a: 1, b: 2, c: 3 };
 *      const myArray = ["a", "b", "c"] as const;
 *
 *      type hasAllKeys = Expect<Equal<typeof arr[number], keyof typeof obj>>;
 *
 *  - make sure that an object contains only keys from another object (but does not need to have all of them):
 *      const en = { "greet": "hello", "thanks": "thanks", "you're welcome": "you're welcome", "goodbye": "goodbye" };
 *      const enUK = { "thanks": "cheers", "you're welcome": "cheers", "goodbye": "cheers" };
 *
 *      type validOverrideKeys = Expect<Equal<never, Exclude<keyof typeof enUK, keyof typeof en>>>;
 *
 */

export type Expect<T extends true> = T;
export type ExpectTrue<T extends true> = T;
export type ExpectFalse<T extends false> = T;
export type IsTrue<T extends true> = T;
export type IsFalse<T extends false> = T;

export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <
  T,
>() => T extends Y ? 1 : 2
  ? true
  : false;
export type NotEqual<X, Y> = true extends Equal<X, Y> ? false : true;

// https://stackoverflow.com/questions/49927523/disallow-call-with-any/49928360#49928360
export type IsAny<T> = 0 extends 1 & T ? true : false;
export type NotAny<T> = true extends IsAny<T> ? false : true;

/**
 * Remove all keys from an object that have a certain value type
 *
 * Example usage:
 * - remove from a list of countries the ones we don't support
 *
 *    const countries = { "US": { isSupported: false as const}, "UK": { isSupported: false as const}, "FR": { isSupported: true as const}, "DE": { isSupported: true as const} };
 *
 *    const supportedCountryCode = typedObjectKeys(countries).filter(
 *      (country): country is keyof OmitByValueType<typeof countries, { isSupported: false }> => countries[country].isSupported
 *    ); // "FR" | "DE"
 */
export type OmitByValueType<T, V> = T extends infer _
  ? {
      [key in OmitKeysByValueType<T, V>]: T[key];
    }
  : never;

type OmitKeysByValueType<T, U> = {
  [P in keyof T]: T[P] extends U ? never : P;
}[keyof T];
