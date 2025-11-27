'use client';

import { useKaizenStore } from '@/hooks/use-kaizen-store';
import { cn } from '@/lib/utils';

export function FollowButton({ id }: { id: string }) {
  const { library, toggleFollow, isMounted } = useKaizenStore();
  
  if (!isMounted) return <div className="w-32 h-10 bg-white/5 rounded animate-pulse" />;

  const isFollowed = library[id];

  return (
    <button 
      onClick={() => toggleFollow(id)}
      className={cn(
        "px-6 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all border",
        isFollowed 
          ? "bg-emerald-600/20 border-emerald-500 text-emerald-400 hover:bg-red-500/20 hover:border-red-500 hover:text-red-400 hover:content-['Unfollow']" 
          : "bg-white text-black border-white hover:bg-gray-200"
      )}
    >
      {isFollowed ? "In Library" : "+ Add to Library"}
    </button>
  );
}

export function ChapterStatus({ mangaId, chapterId }: { mangaId: string, chapterId: string }) {
  const { history, isMounted } = useKaizenStore();
  
  if (!isMounted) return null;

  const isRead = history[mangaId]?.includes(chapterId);

  if (!isRead) return null;

  return (
    <span className="ml-2 text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded border border-gray-700 uppercase tracking-wider">
      Read
    </span>
  );
}