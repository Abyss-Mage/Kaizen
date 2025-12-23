import { getChapterPages, getChapterMetadata, getMangaFeed } from '@/lib/mangadex';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Tracker } from './Tracker';
import { ReaderOverlay } from './ReaderOverlay';

export default async function ChapterReader({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;

  // 1. Data Fetching
  const pagesData = getChapterPages(chapterId);
  const metaData = getChapterMetadata(chapterId);
  const [pages, meta] = await Promise.all([pagesData, metaData]);

  if (!pages || !meta) return notFound();

  // 2. Neighbor Calculation
  const allChapters = await getMangaFeed(meta.mangaId);
  const currentIndex = allChapters.findIndex(ch => ch.id === chapterId);
  const nextChapter = allChapters[currentIndex - 1]; // Feed is DESC
  const prevChapter = allChapters[currentIndex + 1];

  return (
    <div className="min-h-screen bg-[#111] flex flex-col items-center">
      <Tracker mangaId={meta.mangaId} chapterId={chapterId} />
      
      {/* 🎮 INTERACTIVE OVERLAY */}
      <ReaderOverlay 
        mangaId={meta.mangaId}
        chapterNum={meta.chapter}
        prevId={prevChapter?.id}
        nextId={nextChapter?.id}
        prevNum={prevChapter?.chapter}
        nextNum={nextChapter?.chapter}
      />

      {/* 🖼️ IMAGE STREAM */}
      <main className="w-full max-w-3xl pb-32 min-h-screen">
        {pages.data.map((filename, index) => {
          const imageUrl = `${pages.baseUrl}/data/${pages.hash}/${filename}`;
          return (
            <div key={filename} className="relative w-full">
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

      {/* 🏁 FOOTER */}
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