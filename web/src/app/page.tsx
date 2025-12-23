import { createAdminClient, APPWRITE_CONFIG, Query } from '@/lib/appwrite';
import { MangaCard } from '@/components/manga/MangaCard';
import { Search } from '@/components/Search';
import Link from 'next/link';

export default async function Home({
  searchParams,
}: {
  // ⚡ FIX: Use the compatible Next.js 15 Type
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { databases } = await createAdminClient();
  const params = await searchParams;

  // ⚡ FIX: Handle array inputs safely (take the first one if array)
  const q = Array.isArray(params.q) ? params.q[0] : params.q;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;

  const query = q || '';
  const currentPage = Number(pageParam) || 1;
  const LIMIT = 50;
  const offset = (currentPage - 1) * LIMIT;

  // 1. Build Query Filters
  const queries = [
    Query.limit(LIMIT),
    Query.offset(offset),
  ];

  if (query) {
    // 🚨 REQUIREMENT: You MUST have a FullText Index on 'title' in Appwrite Console
    // Key: title_search, Attribute: title, Type: FullText
    queries.push(Query.search('title', query)); 
  } else {
    queries.push(Query.orderDesc('updated_at'));
  }

  // 2. Execute Fetch
  let series: any[] = [];
  let total = 0;

  try {
    const result = await databases.listDocuments(
      APPWRITE_CONFIG.DATABASE_ID,
      APPWRITE_CONFIG.COLLECTION_ID_SERIES,
      queries
    );
    series = result.documents;
    total = result.total;
  } catch (error) {
    console.error("Appwrite Error:", error);
    // Graceful degradation: series remains []
  }

  const totalPages = Math.ceil(total / LIMIT);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // 3. Map Appwrite Document to Interface
  const mappedSeries = series.map((doc: any) => ({
    id: doc.$id, 
    title: doc.title,
    cover_url: doc.cover_url,
    status_raw: doc.status_raw,
    status_scan: doc.status_scan,
  }));

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              KAIZEN
            </h1>
            <Link 
              href="/library"
              className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-bold tracking-widest text-emerald-400 uppercase transition-all"
            >
              My Library
            </Link>
          </div>
          <p className="text-gray-400 mt-2 text-sm">True-Status Manga Integrity.</p>
        </div>
        
        <div className="w-full md:w-1/3">
          <Search />
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 min-h-[50vh]">
        {mappedSeries.map((manga) => (
          <MangaCard 
            key={manga.id} 
            id={manga.id} 
            title={manga.title} 
            coverUrl={manga.cover_url}
            statusRaw={manga.status_raw}
            statusScan={manga.status_scan}
          />
        ))}
        {mappedSeries.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            {query ? `No results for "${query}"` : "Library is empty."}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="mt-12 flex justify-center items-center gap-4">
        <Link
          href={`/?q=${query}&page=${currentPage - 1}`}
          className={`px-6 py-3 rounded-lg border border-white/10 text-sm font-bold uppercase transition-all ${!hasPrevPage ? 'pointer-events-none opacity-50 bg-black' : 'hover:bg-white/5 bg-white/5'}`}
          aria-disabled={!hasPrevPage}
        >
          ← Previous
        </Link>
        
        <span className="text-xs font-mono text-gray-500">
          PAGE {currentPage} / {totalPages || 1}
        </span>
        
        <Link
          href={`/?q=${query}&page=${currentPage + 1}`}
          className={`px-6 py-3 rounded-lg border border-white/10 text-sm font-bold uppercase transition-all ${!hasNextPage ? 'pointer-events-none opacity-50 bg-black' : 'hover:bg-white/5 bg-white/5'}`}
          aria-disabled={!hasNextPage}
        >
          Next →
        </Link>
      </div>
    </main>
  );
}