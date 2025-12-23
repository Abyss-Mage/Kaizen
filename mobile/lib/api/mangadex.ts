import { client } from './network';

// --- Interfaces ---

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

// 🌟 FIX: This Interface was missing in your file
export interface Manga {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  status: string;
  year: number | null;
  authors: string[];
  tags: string[];
}

// --- API Implementation ---

export async function getChapterPages(chapterId: string): Promise<ChapterPages | null> {
  const data = await client.get<any>(`/at-home/server/${chapterId}`);
  if (!data) return null;
  return {
    baseUrl: data.baseUrl,
    hash: data.chapter.hash,
    data: data.chapter.data,
  };
}

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
 * 🌟 Discovery Feed (Popular Manga)
 * Used by Home Screen
 */
export async function getPopularManga(limit = 20, offset = 0): Promise<Manga[]> {
  const params = {
    'limit': limit,
    'offset': offset,
    'includes[]': 'cover_art',
    'order[followedCount]': 'desc',
    'contentRating[]': ['safe', 'suggestive'],
    'availableTranslatedLanguage[]': 'en',
    'hasAvailableChapters': 'true'
  };

  const json = await client.get<any>('/manga', { params });
  if (!json || !json.data) return [];

  return json.data.map((m: any) => {
    const title = m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown Title';
    const coverRel = m.relationships.find((r: any) => r.type === 'cover_art');
    const coverFileName = coverRel?.attributes?.fileName;
    
    return {
      id: m.id,
      title: title,
      description: m.attributes.description.en || '',
      status: m.attributes.status,
      year: m.attributes.year,
      coverUrl: coverFileName ? getCoverUrl(m.id, coverFileName) : null,
      authors: [], 
      tags: [],
    };
  });
}

/**
 * 🔍 Fetch Detailed Metadata
 * Used by Manga Details Screen
 */
export async function getMangaDetails(mangaId: string): Promise<Manga | null> {
  const params = {
    'includes[]': ['author', 'artist', 'cover_art'],
  };

  const json = await client.get<any>(`/manga/${mangaId}`, { params });

  if (!json || !json.data) return null;

  const m = json.data;
  const attr = m.attributes;

  // Extract Author/Artist names
  const authors = m.relationships
    .filter((r: any) => r.type === 'author' || r.type === 'artist')
    .map((r: any) => r.attributes?.name)
    .filter(Boolean);

  const coverRel = m.relationships.find((r: any) => r.type === 'cover_art');
  const coverFileName = coverRel?.attributes?.fileName;

  return {
    id: m.id,
    title: attr.title.en || Object.values(attr.title)[0] || 'Unknown',
    description: attr.description.en || Object.values(attr.description)[0] || '',
    status: attr.status,
    year: attr.year,
    coverUrl: coverFileName ? getCoverUrl(m.id, coverFileName) : null,
    authors: [...new Set(authors)] as string[],
    tags: attr.tags
      .filter((t: any) => t.attributes.group === 'genre')
      .map((t: any) => t.attributes.name.en),
  };
}

export async function getMangaFeed(mangadexId: string): Promise<Chapter[]> {
  const params = {
    'translatedLanguage[]': 'en',
    'order[chapter]': 'desc',
    'limit': 500,
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

export function getCoverUrl(mangaId: string, fileName: string): string {
  return `https://uploads.mangadex.org/covers/${mangaId}/${fileName}.256.jpg`;
}