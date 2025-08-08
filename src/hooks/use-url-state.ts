"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

export interface UrlStateOptions<T> {
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function useUrlState<T extends string | number | boolean>(
  key: string,
  options: UrlStateOptions<T>,
): [T, (value: T | ((prev: T) => T)) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { defaultValue, serialize, deserialize } = options;

  // Get current value from URL
  const currentValue = useMemo(() => {
    const urlValue = searchParams.get(key);
    if (urlValue === null) return defaultValue;

    if (deserialize) {
      try {
        return deserialize(urlValue);
      } catch {
        return defaultValue;
      }
    }

    // Default deserialization for common types
    if (typeof defaultValue === "number") {
      const num = Number(urlValue);
      return isNaN(num) ? defaultValue : (num as T);
    }

    if (typeof defaultValue === "boolean") {
      return (urlValue === "true") as T;
    }

    return urlValue as T;
  }, [searchParams, key, defaultValue, deserialize]);

  // Update URL with new value
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const newValue =
        typeof value === "function"
          ? (value as (prev: T) => T)(currentValue)
          : value;

      const params = new URLSearchParams(searchParams.toString());

      if (
        newValue === defaultValue ||
        newValue === "" ||
        newValue === null ||
        newValue === undefined
      ) {
        params.delete(key);
      } else {
        const serializedValue = serialize
          ? serialize(newValue)
          : String(newValue);
        params.set(key, serializedValue);
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams, key, currentValue, defaultValue, serialize],
  );

  return [currentValue, setValue];
}

// Convenience hook for managing multiple URL state values
export function useUrlStates<T extends Record<string, unknown>>(config: {
  [K in keyof T]: UrlStateOptions<T[K]>;
}): [T, (updates: Partial<T>) => void] {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentValues = useMemo(() => {
    const values = {} as T;

    for (const [key, options] of Object.entries(config) as Array<
      [keyof T, UrlStateOptions<T[keyof T]>]
    >) {
      const urlValue = searchParams.get(key as string);

      if (urlValue === null) {
        values[key] = options.defaultValue;
      } else if (options.deserialize) {
        try {
          values[key] = options.deserialize(urlValue);
        } catch {
          values[key] = options.defaultValue;
        }
      } else {
        // Default deserialization
        if (typeof options.defaultValue === "number") {
          const num = Number(urlValue);
          values[key] = isNaN(num) ? options.defaultValue : (num as T[keyof T]);
        } else if (typeof options.defaultValue === "boolean") {
          values[key] = (urlValue === "true") as T[keyof T];
        } else {
          values[key] = urlValue as T[keyof T];
        }
      }
    }

    return values;
  }, [searchParams, config]);

  const setValues = useCallback(
    (updates: Partial<T>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates) as Array<
        [keyof T, T[keyof T]]
      >) {
        const options = config[key];

        if (
          value === options.defaultValue ||
          value === "" ||
          value === null ||
          value === undefined
        ) {
          params.delete(key as string);
        } else {
          const serializedValue = options.serialize
            ? options.serialize(value)
            : String(value);
          params.set(key as string, serializedValue);
        }
      }

      const newUrl = params.toString() ? `?${params.toString()}` : "";
      router.replace(newUrl, { scroll: false });
    },
    [router, searchParams, config],
  );

  return [currentValues, setValues];
}
