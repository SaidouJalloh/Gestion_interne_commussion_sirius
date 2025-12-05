// src/hooks/useDebounce.ts
// ✅ Hook pour éviter trop de re-renders lors de la saisie
import { useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// UTILISATION EXEMPLE:
// const [searchTerm, setSearchTerm] = useState('');
// const debouncedSearch = useDebounce(searchTerm, 300);
//
// const filteredClients = clients.filter(client =>
//   client.nom.toLowerCase().includes(debouncedSearch.toLowerCase())
// );

