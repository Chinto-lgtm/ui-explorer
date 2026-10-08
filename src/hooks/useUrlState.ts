import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * A piece of page state that lives in the address bar, so it can be linked to,
 * survives a refresh and works with Back. The default value is never written
 * to the URL, which keeps addresses short.
 */
export function useSearchParam<T extends string>(key: string, fallback: T, allowed?: readonly T[]): [T, (value: T) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get(key);
  const value = (raw !== null && (!allowed || allowed.includes(raw as T)) ? raw : fallback) as T;
  const set = useCallback((next: T) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next === fallback || next === '') p.delete(key); else p.set(key, next);
      return p;
    }, { replace: true });
  }, [key, fallback, setParams]);
  return [value, set];
}

/** A boolean flag in the URL: present means on. */
export function useSearchFlag(key: string): [boolean, (on: boolean) => void] {
  const [params, setParams] = useSearchParams();
  const on = params.has(key);
  const set = useCallback((next: boolean) => {
    setParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next) p.set(key, '1'); else p.delete(key);
      return p;
    }, { replace: true });
  }, [key, setParams]);
  return [on, set];
}
