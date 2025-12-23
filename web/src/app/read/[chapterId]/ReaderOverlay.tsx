'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Props {
  mangaId: string;
  chapterNum: string;
  prevId?: string;
  nextId?: string;
  prevNum?: string; // Chapter number for display
  nextNum?: string;
}

export function ReaderOverlay({ mangaId, chapterNum, prevId, nextId, prevNum, nextNum }: Props) {
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  // 1. Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          window.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
          break;
        case 'ArrowRight':
        case ' ':
          window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
          break;
        case 'Escape':
          router.push(`/manga/${mangaId}`);
          break;
        case 'm':
          setVisible(v => !v);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mangaId, router]);

  // 2. Scroll Interaction (Auto-hide)
  useEffect(() => {
    let lastScrollY = window.scrollY;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Show if scrolling UP, Hide if scrolling DOWN
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 👆 TOP BAR: Navigation */}
      <nav 
        className={`fixed top-0 left-0 w-full p-4 z-50 flex justify-between items-center transition-transform duration-300 ${
          visible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
        
        <Link 
          href="/"
          className="relative z-10 px-6 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-xs font-bold text-white hover:bg-white/20 transition-all"
        >
          ✕ Exit
        </Link>

        <div className="relative z-10 flex gap-2">
          {prevId && (
            <Link
              href={`/read/${prevId}`}
              className="px-4 py-2 rounded-full bg-black/60 border border-white/20 text-xs text-gray-300 hover:text-white hover:border-emerald-500 transition-all"
            >
              ← Ch. {prevNum}
            </Link>
          )}
          <div className="px-4 py-2 rounded-full bg-emerald-600/90 text-xs font-bold text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            Ch. {chapterNum}
          </div>
          {nextId && (
            <Link
              href={`/read/${nextId}`}
              className="px-4 py-2 rounded-full bg-black/60 border border-white/20 text-xs text-gray-300 hover:text-white hover:border-emerald-500 transition-all"
            >
              Ch. {nextNum} →
            </Link>
          )}
        </div>
      </nav>

      {/* 👇 TAP ZONES (Mobile) */}
      <div className="fixed inset-0 z-40 flex pointer-events-none">
        {/* Left Tap: Toggle Menu */}
        <div onClick={() => setVisible(v => !v)} className="w-1/4 h-full pointer-events-auto" />
        {/* Center: Scroll Down */}
        <div onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })} className="flex-1 h-full pointer-events-auto" />
      </div>
    </>
  );
}