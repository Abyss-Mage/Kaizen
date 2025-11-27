'use client';

import Image from 'next/image';
import { Badge } from 'lucide-react'; // Assuming you have an icon set or UI lib
import { cn } from '@/lib/utils'; // Standard tailwind-merge utility

interface MangaCardProps {
  title: string;
  coverUrl: string | null;
  statusRaw: string;  // e.g., 'hiatus', 'completed'
  statusScan: string; // e.g., 'ongoing'
  gap?: number;
}

export function MangaCard({ title, coverUrl, statusRaw, statusScan }: MangaCardProps) {
  // Logic to determine status colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'hiatus': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
    }
  };

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-900 border border-white/10 transition-all hover:border-white/20">
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
        <div className="flex h-full w-full items-center justify-center bg-gray-800 text-gray-500">
          No Cover
        </div>
      )}

      {/* 🌑 GRADIENT OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

      {/* ℹ️ CONTENT LAYER */}
      <div className="absolute bottom-0 w-full p-4">
        <h3 className="line-clamp-2 text-lg font-bold text-white leading-tight mb-3">
          {title}
        </h3>

        {/* 🚨 DUAL-STATUS INDICATORS 🚨 */}
        <div className="flex flex-col gap-1.5 text-xs font-mono">
          
          {/* Layer 1: The Truth (Source) */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Author:</span>
            <span className={cn("px-2 py-0.5 rounded border uppercase text-[10px] tracking-wider font-bold", getStatusColor(statusRaw))}>
              {statusRaw}
            </span>
          </div>

          {/* Layer 2: The Translation (Scan) */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Scan:</span>
            <span className={cn("px-2 py-0.5 rounded border uppercase text-[10px] tracking-wider font-bold", getStatusColor(statusScan))}>
              {statusScan}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}