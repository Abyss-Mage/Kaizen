import { getChapterPages } from '@/lib/mangadex';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function ChapterReader({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = await params;
  const pages = await getChapterPages(chapterId);

  if (!pages) return notFound();

  return (
    <div className="min-h-screen bg-[#111]">
      {/* 🧭 NAVIGATION HEADER (Floating) */}
      <nav className="fixed top-0 left-0 w-full p-4 z-50 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <Link 
          href="/" 
          className="pointer-events-auto px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-sm font-bold text-white hover:bg-white/10 transition-all"
        >
          ← Exit
        </Link>
        <div className="pointer-events-auto px-4 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-mono text-gray-400">
          CH. {chapterId.slice(0,8)}...
        </div>
      </nav>

      {/* 🖼️ PASSTHROUGH IMAGE STREAM */}
      <div className="flex flex-col items-center max-w-4xl mx-auto pb-32">
        {pages.data.map((filename, index) => {
          // Construct the Direct URL
          const imageUrl = `${pages.baseUrl}/data/${pages.hash}/${filename}`;
          
          return (
            <div key={filename} className="relative w-full">
              {/* 🚨 ARCHITECT NOTE: Using standard <img> tag.
                 This ensures the REQUEST comes from the CLIENT browser, 
                 bypassing your Vercel/Next.js server bandwidth limits.
              */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={imageUrl}
                alt={`Page ${index + 1}`}
                loading="lazy" // Native browser lazy loading
                className="w-full h-auto block"
              />
            </div>
          );
        })}
      </div>

      {/* 🏁 FOOTER */}
      <div className="max-w-xl mx-auto text-center py-20 px-6 space-y-6">
        <h3 className="text-2xl font-black text-white">Chapter Complete</h3>
        <p className="text-gray-500 text-sm">
          You are reading in <b>Passthrough Mode</b>.<br/>
          Zero images were stored on our servers.
        </p>
        <Link 
          href="/" 
          className="inline-block w-full py-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold tracking-widest uppercase transition-colors"
        >
          Return to Library
        </Link>
      </div>
    </div>
  );
}