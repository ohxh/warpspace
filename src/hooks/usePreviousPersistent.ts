import { useRef } from "react";

/**
 * Hook to return the previous value passed in (or `start` initially),
 * but only update when the value actually changes identity.
 */
export function usePreviousPersistent<T>(
  value: T,
  start?: T,
  cmp?: (x: T, y: T | null) => boolean
) {
  // initialise the ref with previous and current values
  const ref = useRef<{ value: T | null; prev: T | null }>({
    value: value,
    prev: start || null,
  });

  const current = ref.current.value;

  // if the value passed into hook doesn't match what we store as "current"
  // move the "current" to the "previous"
  // and store the passed value as "current"
  if (cmp ? !cmp(value, current) : value !== current) {
    ref.current = {
      value: value,
      prev: current,
    };
  }

  // return the previous value only
  return ref.current.prev;
}
