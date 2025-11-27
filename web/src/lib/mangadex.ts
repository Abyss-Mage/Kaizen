const MANGADEX_API = 'https://api.mangadex.org';

export interface Chapter {
  id: string;
  chapter: string;
  title: string;
  publishAt: string;
  scanGroup?: string;
}
export interface ChapterPages {
  baseUrl: string;
  hash: string;
  data: string[]; // Array of filenames
}

export async function getChapterPages(chapterId: string): Promise<ChapterPages | null> {
  try {
    // 1. Fetch the MangaDex@Home Node URL
    const res = await fetch(`${MANGADEX_API}/at-home/server/${chapterId}`);
    
    if (!res.ok) throw new Error('Failed to find chapter node');
    
    const json = await res.json();
    
    return {
      baseUrl: json.baseUrl,
      hash: json.chapter.hash,
      data: json.chapter.data,
    };
  } catch (error) {
    console.error('Failed to fetch pages:', error);
    return null;
  }
}

export async function getMangaFeed(mangadexId: string) {
  try {
    // Determine the URL
    const url = new URL(`${MANGADEX_API}/manga/${mangadexId}/feed`);
    
    // Set params using URLSearchParams (Native API)
    const params = {
      'translatedLanguage[]': 'en',
      'order[chapter]': 'desc',
      'limit': '500', 
      'includes[]': 'scanlation_group',
    };
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    // Use native fetch (Next.js automatically caches this if we want, 
    // but for "fresh" data we can use no-store)
    const res = await fetch(url.toString(), { 
      cache: 'no-store' // Ensure we always get the latest chapters
    });

    if (!res.ok) {
      console.error(`MangaDex API Error: ${res.statusText}`);
      return [];
    }

    const json = await res.json();

    return json.data.map((ch: any) => ({
      id: ch.id,
      chapter: ch.attributes.chapter,
      title: ch.attributes.title,
      publishAt: ch.attributes.publishAt,
      scanGroup: ch.relationships.find((r: any) => r.type === 'scanlation_group')?.attributes?.name
    })) as Chapter[];

  } catch (error) {
    console.error('Failed to fetch chapters:', error);
    return [];
  }
}