'use client';

import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce'; 

// If you don't want to install a package, here is a manual debounce implementation:
export function Search() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Debounce prevents a database request on every single keystroke
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-700 bg-gray-900 py-[9px] pl-4 text-sm text-white placeholder:text-gray-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        placeholder="Search titles..."
        onChange={(e) => {
          // Simple debounce via timeout if you don't have the library
          // Ideally, install 'use-debounce' for production grade
          const val = e.target.value;
          setTimeout(() => handleSearch(val), 300);
        }}
        defaultValue={searchParams.get('q')?.toString()}
      />
    </div>
  );
}