// src/hooks/useKeyboard.js
// ✅ Hook pour gérer les raccourcis clavier
import { useEffect } from 'react';

export function useKeyboard(key, callback, deps = []) {
    useEffect(() => {
        const handler = (e) => {
            if (e.key === key || e.code === key) {
                callback(e);
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [key, callback, ...deps]);
}

// EXEMPLES D'UTILISATION:

// 1. Ouvrir modal avec Ctrl+N
// useKeyboard('n', (e) => {
//   if (e.ctrlKey || e.metaKey) {
//     e.preventDefault();
//     setModalOpen(true);
//   }
// }, []);

// 2. Fermer modal avec Escape
// useKeyboard('Escape', () => {
//   setModalOpen(false);
// }, []);

// 3. Focus recherche avec /
// useKeyboard('/', (e) => {
//   e.preventDefault();
//   searchInputRef.current?.focus();
// }, []);

// 4. Sauvegarder avec Ctrl+S
// useKeyboard('s', (e) => {
//   if (e.ctrlKey || e.metaKey) {
//     e.preventDefault();
//     handleSave();
//   }
// }, []);