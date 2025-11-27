'use client';

import { useEffect } from 'react';
import { useKaizenStore } from '@/hooks/use-kaizen-store';

export function Tracker({ mangaId, chapterId }: { mangaId: string, chapterId: string }) {
  const { markChapterRead } = useKaizenStore();

  useEffect(() => {
    if (mangaId && chapterId) {
      markChapterRead(mangaId, chapterId);
    }
  }, [mangaId, chapterId, markChapterRead]);

  return null; // Renderless component
}