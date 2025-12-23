'use client';

import { useEffect, useState } from 'react';
import { useKaizenStore } from '@/hooks/use-kaizen-store';
import { Client, Databases, Query } from 'appwrite'; // Client SDK for Client Component
import { MangaCard } from '@/components/manga/MangaCard';
import Link from 'next/link';

// Initialize Client SDK (Exposed to Browser)
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
const databases = new Databases(client);

export default function LibraryPage() {
  const { library, isMounted } = useKaizenStore();
  const [mangaList, setMangaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibrary() {
      if (!isMounted) return;

      const followedIds = Object.keys(library);
      if (followedIds.length === 0) {
        setMangaList([]);
        setLoading(false);
        return;
      }

      try {
        // Appwrite "IN" query
        const result = await databases.listDocuments(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
            process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SERIES!,
            [Query.equal('mangadex_id', followedIds)] // Auto-handles array as "IN"
        );
        
        setMangaList(result.documents.map((doc: any) => ({
             ...doc,
             id: doc.$id // Normalize
        })));
      } catch (error) {
        console.error('Library fetch failed:', error);
      }
      setLoading(false);
    }
    fetchLibrary();
  }, [library, isMounted]);

  if (!isMounted || loading) return <div className="p-12 text-emerald-500 animate-pulse">SYNCING LIBRARY...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
       {/* ... Header Code (same as before) ... */}
       
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
    </div>
  );
}