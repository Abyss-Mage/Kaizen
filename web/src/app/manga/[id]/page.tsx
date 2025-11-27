import { createClient } from '@/utils/supabase/server';
import { getMangaFeed } from '@/lib/mangadex';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { FollowButton, ChapterStatus } from './MangaActions'; 

// Helper for Status Badge Colors
const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'hiatus': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
    case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
    default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
  }
};

export default async function MangaDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // 1. Fetch Metadata from DB FIRST to get the correct MangaDex ID
  // We need 'mangadex_id' to query the external API, but the URL param 'id' is our internal Supabase UUID.
  const { data: manga, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !manga) return notFound();

  // 2. Fetch Chapters using the Real MangaDex ID
  // This uses our native fetch utility (no axios)
  const chapters = await getMangaFeed(manga.mangadex_id);

  // 3. The Gap Calculation
  // Calculates how far behind the scanlation is from the raw release
  const latestScan = chapters[0]?.chapter ? parseFloat(chapters[0].chapter) : 0;
  const rawTotal = manga.total_chapters_raw || 0;
  const gap = rawTotal > latestScan ? (rawTotal - latestScan) : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* 🖼️ HERO SECTION */}
      <div className="relative h-[40vh] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
        {manga.cover_url && (
          <Image 
            src={manga.cover_url} 
            alt={manga.title} 
            fill 
            className="object-cover opacity-30 blur-sm"
          />
        )}
        
        <div className="absolute bottom-0 z-20 w-full p-6 md:p-12 flex flex-col md:flex-row gap-8 items-end">
          {/* Cover Card */}
          <div className="relative w-32 md:w-48 aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl shrink-0">
             {manga.cover_url && (
              <Image src={manga.cover_url} alt={manga.title} fill className="object-cover" />
            )}
          </div>

          {/* Info Block */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-start gap-4">
                <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                {manga.title}
                </h1>
                {/* 🚨 INTERACTIVE: Local-First Library Toggle */}
                <FollowButton id={manga.mangadex_id} />
            </div>
            
            {/* 🚨 THE TRUTH DASHBOARD */}
            <div className="flex flex-wrap gap-4 text-sm font-mono">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-gray-400">AUTHOR STATUS:</span>
                <span className={cn("uppercase font-bold", getStatusColor(manga.status_raw))}>
                  {manga.status_raw}
                </span>
              </div>

              {/* The Gap Indicator */}
              {gap > 0 ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-900/20 border border-red-500/50">
                  <span className="text-red-400 font-bold">🚨 BEHIND BY {gap.toFixed(1)} CHAPTERS</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/20 border border-emerald-500/50">
                  <span className="text-emerald-400 font-bold">✨ UP TO DATE</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 📖 CONTENT & CHAPTERS */}
      <div className="max-w-6xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left: Description */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="text-lg font-bold border-l-4 border-emerald-500 pl-3">Synopsis</h3>
          <p className="text-gray-400 leading-relaxed text-sm whitespace-pre-wrap">
            {manga.description || "No description available."}
          </p>
        </div>

        {/* Right: Chapter Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold border-l-4 border-cyan-500 pl-3">
              Scanlation Feed
            </h3>
            <span className="text-xs text-gray-500">{chapters.length} chapters available</span>
          </div>

          <div className="space-y-2">
            {chapters.map((ch) => (
              <div 
                key={ch.id} 
                className="group flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all cursor-pointer"
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-white">Ch. {ch.chapter}</span>
                    {/* 🚨 INTERACTIVE: Read Status Badge */}
                    <ChapterStatus mangaId={manga.mangadex_id} chapterId={ch.id} />
                    {ch.title && <span className="text-sm text-gray-400 line-clamp-1">- {ch.title}</span>}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{new Date(ch.publishAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-emerald-400/70">{ch.scanGroup || "Unknown Group"}</span>
                  </div>
                </div>
                
                <Link 
                  href={`/read/${ch.id}`}
                  className="px-4 py-2 rounded bg-white text-black font-bold text-xs uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Read
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}