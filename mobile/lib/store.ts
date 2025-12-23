import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';

// 1. Initialize MMKV (C++ JSI Storage)
const storage = new MMKV({
  id: 'kaizen-storage',
  encryptionKey: 'hunter2', // Optional: secure storage
});

// 2. Create an adapter for Zustand
const mmkvStorage = {
  setItem: (name: string, value: string) => storage.set(name, value),
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => storage.delete(name),
};

interface ReadHistory {
  [mangaId: string]: string[]; // Array of read chapter IDs
}

interface Library {
  [mangaId: string]: boolean;
}

interface KaizenState {
  history: ReadHistory;
  library: Library;
  markChapterRead: (mangaId: string, chapterId: string) => void;
  toggleFollow: (mangaId: string) => void;
  clearHistory: () => void;
}

// 3. The Store (Logic ported from web, hydration removed as it's handled by persist)
export const useKaizenStore = create<KaizenState>()(
  persist(
    (set) => ({
      history: {},
      library: {},

      markChapterRead: (mangaId, chapterId) =>
        set((state) => {
          const mangaHistory = state.history[mangaId] || [];
          if (mangaHistory.includes(chapterId)) return state;

          return {
            history: {
              ...state.history,
              [mangaId]: [...mangaHistory, chapterId],
            },
          };
        }),

      toggleFollow: (mangaId) =>
        set((state) => {
          const newLibrary = { ...state.library };
          if (newLibrary[mangaId]) {
            delete newLibrary[mangaId];
          } else {
            newLibrary[mangaId] = true;
          }
          return { library: newLibrary };
        }),

      clearHistory: () => set({ history: {} }),
    }),
    {
      name: 'kaizen-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);