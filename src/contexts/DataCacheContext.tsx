import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, expiresIn?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  invalidate: (pattern?: string) => void;
  has: (key: string) => boolean;
}

const DataCacheContext = createContext<CacheContextType | undefined>(undefined);

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000;

export const DataCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cacheRef = useRef<Map<string, CacheEntry<any>>>(new Map());
  const [, forceUpdate] = useState({});

  const isExpired = useCallback((entry: CacheEntry<any>): boolean => {
    return Date.now() - entry.timestamp > entry.expiresIn;
  }, []);

  const get = useCallback(<T,>(key: string): T | null => {
    const entry = cacheRef.current.get(key);

    if (!entry) {
      return null;
    }

    if (isExpired(entry)) {
      cacheRef.current.delete(key);
      return null;
    }

    return entry.data as T;
  }, [isExpired]);

  const set = useCallback(<T,>(key: string, data: T, expiresIn: number = DEFAULT_CACHE_DURATION): void => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
    forceUpdate({});
  }, []);

  const remove = useCallback((key: string): void => {
    cacheRef.current.delete(key);
    forceUpdate({});
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
    forceUpdate({});
  }, []);

  const invalidate = useCallback((pattern?: string): void => {
    if (!pattern) {
      clear();
      return;
    }

    const keysToDelete: string[] = [];
    cacheRef.current.forEach((_, key) => {
      if (key.includes(pattern)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => cacheRef.current.delete(key));
    forceUpdate({});
  }, [clear]);

  const has = useCallback((key: string): boolean => {
    const entry = cacheRef.current.get(key);
    if (!entry) return false;
    if (isExpired(entry)) {
      cacheRef.current.delete(key);
      return false;
    }
    return true;
  }, [isExpired]);

  const value: CacheContextType = {
    get,
    set,
    remove,
    clear,
    invalidate,
    has,
  };

  return (
    <DataCacheContext.Provider value={value}>
      {children}
    </DataCacheContext.Provider>
  );
};

export const useDataCache = (): CacheContextType => {
  const context = useContext(DataCacheContext);
  if (!context) {
    throw new Error('useDataCache must be used within DataCacheProvider');
  }
  return context;
};

export const useCachedData = <T,>(
  key: string,
  fetchFn: () => Promise<T>,
  expiresIn?: number
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
} => {
  const cache = useDataCache();
  const [data, setData] = useState<T | null>(cache.get<T>(key));
  const [loading, setLoading] = useState<boolean>(!cache.has(key));
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      cache.set(key, result, expiresIn);
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`Error fetching data for key: ${key}`, error);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, cache, expiresIn]);

  React.useEffect(() => {
    const cachedData = cache.get<T>(key);
    if (cachedData !== null) {
      setData(cachedData);
      setLoading(false);
    } else {
      fetchData();
    }
  }, [key]);

  return { data, loading, error, refetch: fetchData };
};
