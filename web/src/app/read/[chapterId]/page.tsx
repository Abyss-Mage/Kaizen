import { getChapterPages, getChapterMetadata, getMangaFeed } from '@/lib/mangadex';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Tracker } from './Tracker';

export default async function ChapterReader({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;

  // 1. Parallel Fetching: Pages + Metadata
  const pagesData = getChapterPages(chapterId);
  const metaData = getChapterMetadata(chapterId);
  
  const [pages, meta] = await Promise.all([pagesData, metaData]);

  if (!pages || !meta) return notFound();

  // 2. JIT Neighbor Calculation
  // We fetch the full feed to find out what comes next.
  // This seems heavy, but MangaDex API is fast and strictly paginated feeds are complex to link.
  const allChapters = await getMangaFeed(meta.mangaId);
  
  // Find current index
  const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
  
  // Feed is ordered DESC (Newest first). 
  // So "Next Chapter" (Progress story) is index - 1.
  // "Prev Chapter" (Go back) is index + 1.
  const nextChapter = allChapters[currentIndex - 1];
  const prevChapter = allChapters[currentIndex + 1];

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center">
      <Tracker mangaId={meta.mangaId} chapterId={chapterId} />
      <nav className="fixed top-0 left-0 w-full p-4 z-50 flex justify-between items-center transition-all opacity-0 hover:opacity-100 focus-within:opacity-100">
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
        
        <Link 
          href={`/manga/${meta.mangaId}`} // We might need to resolve this to Supabase ID if your routing requires it, 
                                          // but for now let's assume direct MangaDex ID routing or you have a map.
                                          // ideally, link back to Home or use the browser back history.
          className="relative z-10 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-sm font-bold text-white hover:bg-white/20 transition-all"
        >
          ← Exit
        </Link>

        <div className="relative z-10 flex gap-2">
          {prevChapter && (
            <Link
              href={`/read/${prevChapter.id}`}
              className="px-4 py-2 rounded-full bg-black/60 border border-white/20 text-xs text-gray-300 hover:text-white hover:border-emerald-500 transition-all"
            >
              Prev: Ch. {prevChapter.chapter}
            </Link>
          )}
          <div className="px-4 py-2 rounded-full bg-emerald-600/90 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            Ch. {meta.chapter}
          </div>
          {nextChapter && (
            <Link
              href={`/read/${nextChapter.id}`}
              className="px-4 py-2 rounded-full bg-black/60 border border-white/20 text-xs text-gray-300 hover:text-white hover:border-emerald-500 transition-all"
            >
              Next: Ch. {nextChapter.chapter}
            </Link>
          )}
        </div>
      </nav>

      {/* 🖼️ PASSTHROUGH IMAGE STREAM */}
      <main className="w-full max-w-3xl pb-32">
        {pages.data.map((filename, index) => {
          const imageUrl = `${pages.baseUrl}/data/${pages.hash}/${filename}`;
          return (
            <div key={filename} className="relative w-full">
              {/* Passthrough <img> 
                 loading="lazy" creates a basic 'Sliding Window' effect natively 
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl}
                alt={`Page ${index + 1}`}
                loading="lazy" 
                className="w-full h-auto block"
              />
            </div>
          );
        })}
      </main>

      {/* 🏁 FOOTER NAVIGATION */}
      <div className="w-full max-w-xl mx-auto text-center py-20 px-6 space-y-8">
        <div className="space-y-2">
          <h3 className="text-2xl font-black text-white">Chapter {meta.chapter} Complete</h3>
          <p className="text-gray-500 text-sm">{meta.title}</p>
        </div>

        <div className="flex flex-col gap-3">
          {nextChapter ? (
            <Link 
              href={`/read/${nextChapter.id}`}
              className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transform hover:-translate-y-1"
            >
              Read Chapter {nextChapter.chapter} →
            </Link>
          ) : (
            <div className="p-4 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 text-sm">
              You have reached the latest chapter.
            </div>
          )}

          <Link 
            href="/" 
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors"
          >
            Return to Library
          </Link>
        </div>
      </div>
    </div>
  );
}