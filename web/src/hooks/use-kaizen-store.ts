'use client';

import { useState, useEffect } from 'react';

interface ReadHistory {
  [mangaId: string]: string[]; // Array of read chapter IDs
}

interface Library {
  [mangaId: string]: boolean; // Simple Set logic
}

export function useKaizenStore() {
  const [history, setHistory] = useState<ReadHistory>({});
  const [library, setLibrary] = useState<Library>({});
  const [mounted, setMounted] = useState(false);

  // Load from Storage on Mount
  useEffect(() => {
    setMounted(true);
    try {
      const storedHistory = localStorage.getItem('kaizen-history');
      const storedLibrary = localStorage.getItem('kaizen-library');
      
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      if (storedLibrary) setLibrary(JSON.parse(storedLibrary));
    } catch (e) {
      console.error('Failed to load local state', e);
    }
  }, []);

  // Actions
  const markChapterRead = (mangaId: string, chapterId: string) => {
    setHistory((prev) => {
      const mangaHistory = prev[mangaId] || [];
      if (mangaHistory.includes(chapterId)) return prev;
      
      const newHistory = { ...prev, [mangaId]: [...mangaHistory, chapterId] };
      localStorage.setItem('kaizen-history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const toggleFollow = (mangaId: string) => {
    setLibrary((prev) => {
      const newState = { ...prev };
      if (newState[mangaId]) {
        delete newState[mangaId];
      } else {
        newState[mangaId] = true;
      }
      localStorage.setItem('kaizen-library', JSON.stringify(newState));
      return newState;
    });
  };

  return {
    history,
    library,
    markChapterRead,
    toggleFollow,
    isMounted: mounted, // Use this to prevent Hydration Mismatch
  };
}