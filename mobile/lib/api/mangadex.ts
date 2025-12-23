import { client } from './network';

// --- Shared Interfaces (Ported from Web) ---
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

export interface MangaMetadata {
  mangaId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  status: string;
  coverArtId?: string; // Helpful for fetching cover URL
}

export interface Manga {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  status: string;
  year: number | null;
}

/**
 * 🌟 NEW: Discovery Feed
 * Fetches popular manga for the home screen.
 */
export async function getPopularManga(limit = 20, offset = 0): Promise<Manga[]> {
  const params = {
    'limit': limit,
    'offset': offset,
    'includes[]': 'cover_art', // Critical: We need this relation to get the image filename
    'order[followedCount]': 'desc', // Most popular
    'contentRating[]': ['safe', 'suggestive'],
    'availableTranslatedLanguage[]': 'en',
    'hasAvailableChapters': 'true'
  };

  const json = await client.get<any>('/manga', { params });

  if (!json || !json.data) return [];

  return json.data.map((m: any) => {
    // 1. Extract Title (English preferred, fallback to first available)
    const title = m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown Title';
    
    // 2. Find Cover Art Relationship
    const coverRel = m.relationships.find((r: any) => r.type === 'cover_art');
    const coverFileName = coverRel?.attributes?.fileName;
    
    // 3. Construct URL
    const coverUrl = coverFileName 
      ? getCoverUrl(m.id, coverFileName) 
      : null;

    return {
      id: m.id,
      title: title,
      description: m.attributes.description.en || '',
      status: m.attributes.status,
      year: m.attributes.year,
      coverUrl: coverUrl
    };
  });
}

// --- API Implementation ---

/**
 * Fetches the specific pages for a chapter.
 * Used by the Reader component.
 */
export async function getChapterPages(chapterId: string): Promise<ChapterPages | null> {
  // Mobile Optimization: We don't need the full node URL logic here if the client handles it,
  // but we stick to the MD standard.
  const data = await client.get<any>(`/at-home/server/${chapterId}`);
  
  if (!data) return null;

  return {
    baseUrl: data.baseUrl,
    hash: data.chapter.hash,
    data: data.chapter.data,
  };
}

/**
 * Fetches metadata for a single chapter + parent manga relationship.
 */
export async function getChapterMetadata(chapterId: string) {
  const json = await client.get<any>(`/chapter/${chapterId}`);
  
  if (!json) return null;

  const mangaRel = json.data.relationships.find((r: any) => r.type === 'manga');
  
  return {
    mangaId: mangaRel?.id,
    ...json.data.attributes,
  };
}

/**
 * The Feed: Critical for the Manga Detail view.
 * Adapted to return strictly typed Chapter objects.
 */
export async function getMangaFeed(mangadexId: string): Promise<Chapter[]> {
  const params = {
    'translatedLanguage[]': 'en',
    'order[chapter]': 'desc',
    'limit': 500, // Pagination handled by FlashList in UI later
    'includes[]': 'scanlation_group',
  };

  const json = await client.get<any>(`/manga/${mangadexId}/feed`, { params });

  if (!json || !json.data) return [];

  return json.data.map((ch: any) => ({
    id: ch.id,
    chapter: ch.attributes.chapter,
    title: ch.attributes.title,
    publishAt: ch.attributes.publishAt,
    scanGroup: ch.relationships.find((r: any) => r.type === 'scanlation_group')?.attributes?.name,
  }));
}

// --- Mobile Specific Additions ---

/**
 * Helper to construct cover URLs.
 * React Native <Image> needs a direct string, not a promise.
 */
export function getCoverUrl(mangaId: string, fileName: string): string {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`; // Requesting 256px thumb for list performance
}