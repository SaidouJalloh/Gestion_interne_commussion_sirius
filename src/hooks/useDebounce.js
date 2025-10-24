// src/hooks/useDebounce.js
// ✅ Hook pour éviter trop de re-renders lors de la saisie
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 500) {
    const [debouncedValue, setDebouncedValue] = useState(value);

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