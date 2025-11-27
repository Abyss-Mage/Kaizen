import { createClient } from '@/utils/supabase/server';
import { MangaCard } from '@/components/manga/MangaCard';

export default async function Home() {
  const supabase = await createClient();

  // 1. Fetch Series (Using the View or Direct Table)
  const { data: series, error } = await supabase
    .from('series')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error("Supabase Error:", error);
    return <div className="p-10 text-red-500">Failed to load library.</div>;
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-12">
      <header className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
          KAIZEN
        </h1>
        <p className="text-gray-400 mt-2">
          True-Status Manga Integrity. No Lies.
        </p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {series?.map((manga) => (
          <MangaCard 
            key={manga.id}
            title={manga.title}
            coverUrl={manga.cover_url}
            statusRaw={manga.status_raw}   // e.g. "Hiatus"
            statusScan={manga.status_scan} // e.g. "Ongoing"
          />
        ))}
      </div>
    </main>
  );
}