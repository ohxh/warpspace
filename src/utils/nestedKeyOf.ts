export type NestedKeyOf<T extends object> = {
  [Key in keyof T & (string | number)]: T[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<T[Key]>}`
    : `${Key}`;
}[keyof T & (string | number)];

export type NestedValue<
  T extends object,
  P extends string
> = P extends `${infer K}.${infer U}`
  ? K extends keyof T
    ? T[K] extends object
      ? NestedValue<T[K], U>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never;

export function get<T extends object, K extends NestedKeyOf<T>>(
  object: T,
  path: K
) {
  const keys = path.split(".");
  let result = object;
  for (const key of keys) {
    //@ts-ignore
    result = result[key];
  }
  return result as NestedValue<T, K>;
}

export function set<
  T extends object,
  K extends NestedKeyOf<T>,
  V extends NestedValue<T, K>
>(object: T, path: K, value: V) {
  const keys = path.split(".");
  let result = object;
  for (const key of keys.slice(0, -1)) {
    //@ts-ignore
    result = result[key];
  }
  //@ts-ignore
  result[keys.slice(-1)[0]] = value;
}
