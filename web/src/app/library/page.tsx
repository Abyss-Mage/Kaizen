'use client';

import { useEffect, useState } from 'react';
import { useKaizenStore } from '@/hooks/use-kaizen-store';
import { createClient } from '@/utils/supabase/client';
import { MangaCard } from '@/components/manga/MangaCard';
import Link from 'next/link';

export default function LibraryPage() {
  const { library, isMounted } = useKaizenStore();
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLibrary() {
      if (!isMounted) return;

      const followedIds = Object.keys(library);

      if (followedIds.length === 0) {
        setMangaList([]);
        setLoading(false);
        return;
      }

      // 1. Client-Side Query
      // We ask Supabase: "Give me details for these specific IDs"
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .in('mangadex_id', followedIds); // Efficient bulk lookup

      if (error) {
        console.error('Library fetch failed:', error);
      } else {
        setMangaList(data || []);
      }
      setLoading(false);
    }

    fetchLibrary();
  }, [library, isMounted, supabase]);

  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-black text-white p-12 flex items-center justify-center">
        <div className="animate-pulse text-emerald-500 font-mono">SYNCING LIBRARY...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <header className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">MY LIBRARY</h1>
          <p className="text-gray-500 text-sm mt-1">
            {mangaList.length} Series Followed • Local Storage
          </p>
        </div>
        <Link 
          href="/" 
          className="px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 text-xs font-bold transition-all"
        >
          ← BACK TO SEARCH
        </Link>
      </header>

      {/* 📂 EMPTY STATE */}
      {mangaList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-2xl">
          <p className="text-gray-500 mb-4">Your library is empty.</p>
          <Link 
            href="/" 
            className="px-6 py-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-colors"
          >
            DISCOVER MANGA
          </Link>
        </div>
      ) : (
        /* 📚 GRID */
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {mangaList.map((manga) => (
            <MangaCard 
              key={manga.id}
              id={manga.id}
              title={manga.title}
              coverUrl={manga.cover_url}
              statusRaw={manga.status_raw}
              statusScan={manga.status_scan}
            />
          ))}
        </div>
      )}
    </div>
  );
}