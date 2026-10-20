import { useEffect, useState } from 'react';

// Как useState, только значение лежит еще и в localStorage
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // localStorage может быть недоступен, тогда просто работаем без него
    }
  }, [key, value]);

  return [value, setValue];
}
