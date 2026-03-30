import { useState, useMemo, useRef, useCallback, useSyncExternalStore } from 'react';

function useDebouncedValue(value: string, delayMs: number): { debouncedValue: string; isPending: boolean } {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to value changes via a ref-based approach to avoid effect + setState
  const latestValue = useRef(value);
  latestValue.current = value;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (timerRef.current) clearTimeout(timerRef.current);

      if (latestValue.current === '') {
        setDebouncedValue('');
        setIsPending(false);
      } else {
        setIsPending(true);
        timerRef.current = setTimeout(() => {
          setDebouncedValue(latestValue.current);
          setIsPending(false);
          onStoreChange();
        }, delayMs);
      }

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, delayMs],
  );

  useSyncExternalStore(subscribe, () => debouncedValue);

  return { debouncedValue, isPending };
}

export function useSearch<T>(
  items: T[],
  searchFn: (items: T[], query: string) => T[],
): {
  query: string;
  setQuery: (q: string) => void;
  results: T[];
  isSearching: boolean;
} {
  const [query, setQuery] = useState('');
  const { debouncedValue: debouncedQuery, isPending: isSearching } = useDebouncedValue(query, 300);

  const results = useMemo(
    () => searchFn(items, debouncedQuery),
    [items, debouncedQuery, searchFn],
  );

  return { query, setQuery, results, isSearching };
}
