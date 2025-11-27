import { createClient } from '@/utils/supabase/server';
import { MangaCard } from '@/components/manga/MangaCard';
import { Search } from '@/components/Search';

export default async function Home({
  searchParams,
}: {
  // 🚨 ARCHITECT UPDATE: Type definition must be a Promise
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}) {
  const supabase = await createClient();
  
  // 🚨 ARCHITECT FIX: Await the params to extract the query
  const { q } = await searchParams;
  const query = q || '';

  // 1. Dynamic Query Construction
  let dbQuery = supabase
    .from('series')
    .select('*')
    // Search is relevant, so we prioritize matches. 
    // If no search, we sort by updates.
    .order('updated_at', { ascending: false })
    .limit(50);

  // 2. Apply Search Filter
  if (query) {
    // ILIKE is case-insensitive pattern matching
    dbQuery = supabase
      .from('series')
      .select('*')
      .ilike('title', `%${query}%`)
      .limit(50);
  }

  const { data: series, error } = await dbQuery;

  if (error) {
    console.error("Supabase Error:", error);
    return <div className="p-10 text-red-500">Failed to load library.</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            KAIZEN
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            True-Status Manga Integrity.
          </p>
        </div>
        
        {/* Search Bar Integration */}
        <div className="w-full md:w-1/3">
          <Search />
        </div>
      </header>

      {/* Results Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {series?.map((manga) => (
          <MangaCard 
            key={manga.id}
            id={manga.id} // 🚨 ARCHITECT FIX: Explicitly pass the ID
            title={manga.title}
            coverUrl={manga.cover_url}
            statusRaw={manga.status_raw}
            statusScan={manga.status_scan}
          />
        ))}
        
        {series?.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500">
            No manga found matching "{query}"
          </div>
        )}
      </div>
    </main>
  );
}