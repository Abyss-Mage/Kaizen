'use client';

import Image from 'next/image';
import Link from 'next/link'; // 1. Import Link
import { cn } from '@/lib/utils';

interface MangaCardProps {
  id: string; // 2. Add ID to props
  title: string;
  coverUrl: string | null;
  statusRaw: string;
  statusScan: string;
}

export function MangaCard({ id, title, coverUrl, statusRaw, statusScan }: MangaCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'hiatus': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    // 3. Wrap in Link component. Added 'block' to behave like a container.
    <Link 
      href={`/manga/${id}`}
      className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-900 border border-white/10 transition-all hover:border-white/20 block cursor-pointer"
    >
      {/* 🖼️ IMAGE: Passthrough (Zero-Storage) */}
      {coverUrl ? (
        <Image 
          src={coverUrl} 
          alt={title}
          fill
          className="object-cover opacity-80 transition-opacity group-hover:opacity-100"
          sizes="(max-width: 768px) 50vw, 20vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-500 text-sm">
          No Cover
        </div>
      )}

      {/* 🌑 GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />

      {/* ℹ️ CONTENT LAYER */}
      <div className="absolute bottom-0 w-full p-3">
        <h3 className="line-clamp-2 text-sm font-bold text-white leading-tight mb-3">
          {title}
        </h3>

        {/* 🚨 DUAL-STATUS INDICATORS 🚨 */}
        <div className="flex flex-col gap-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Author</span>
            <span className={cn("px-1.5 py-0.5 rounded border uppercase text-[9px] font-bold tracking-wider", getStatusColor(statusRaw))}>
              {statusRaw}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Scan</span>
            <span className={cn("px-1.5 py-0.5 rounded border uppercase text-[9px] font-bold tracking-wider", getStatusColor(statusScan))}>
              {statusScan}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}