export interface LandingMediaItem {
  id: string;
  title: string;
  mediaType: 'video' | 'audio' | 'document';
  videoSource?: 'youtube' | 'vimeo' | 'mp4' | 'upload' | string;
  audioSource?: 'mp3' | 'external' | 'upload' | 'iframe' | string;
  sourceUrl?: string;
  category?: string;
  description?: string;
  featured?: boolean;
  status: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Extracts src URL from an <iframe> string or returns the URL as-is
 */
export function extractIframeSrc(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  const srcMatch = trimmed.match(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/i);
  if (srcMatch && srcMatch[1]) {
    return srcMatch[1];
  }
  return trimmed;
}

/**
 * Extracts height attribute from <iframe> tag if present, or returns appropriate default
 */
export function extractIframeHeight(input?: string, fallback: number = 180): number {
  if (!input) return fallback;
  const trimmed = input.trim();
  const heightMatch = trimmed.match(/\bheight=["']?(\d+)(?:px)?["']?/i);
  if (heightMatch && heightMatch[1]) {
    return parseInt(heightMatch[1], 10);
  }
  if (trimmed.includes('w.soundcloud.com')) return 166;
  if (trimmed.includes('open.spotify.com')) return 152;
  if (trimmed.includes('fireside.fm')) return 200;
  if (trimmed.includes('podbean.com')) return 150;
  return fallback;
}

/**
 * Detects whether an audio item is an iframe embed
 */
export function isAudioIframe(sourceUrl?: string, audioSource?: string): boolean {
  if (audioSource === 'iframe') return true;
  if (!sourceUrl) return false;
  const trimmed = sourceUrl.trim().toLowerCase();
  if (trimmed.startsWith('<iframe') || trimmed.includes('<iframe')) return true;
  if (
    trimmed.includes('fireside.fm') ||
    trimmed.includes('w.soundcloud.com') ||
    trimmed.includes('open.spotify.com/embed') ||
    trimmed.includes('embed.podcasts.apple.com') ||
    trimmed.includes('podbean.com/player') ||
    trimmed.includes('libsyn.com/embed') ||
    trimmed.includes('transistor.fm/embed')
  ) {
    return true;
  }
  return false;
}

/**
 * Extracts YouTube video ID from standard or embed URLs
 */
export function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return match[2];
    }
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * Returns YouTube thumbnail URL if applicable
 */
export function getYouTubeThumbnail(url?: string): string | null {
  const id = getYouTubeVideoId(url);
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001').replace(/\/api\/v1\/?$/, '');

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || `HTTP Error ${res.status}`);
  }
  return res.json();
}

export const mediaApi = {
  // Get media items with filters
  async getMedia(filter?: {
    mediaType?: string;
    category?: string;
    status?: string;
    featured?: boolean;
    search?: string;
  }, signal?: AbortSignal): Promise<LandingMediaItem[]> {
    try {
      const params = new URLSearchParams();
      if (filter?.mediaType && filter.mediaType !== 'all') params.append('mediaType', filter.mediaType);
      if (filter?.category && filter.category !== 'all') params.append('category', filter.category);
      if (filter?.status && filter.status !== 'all') params.append('status', filter.status);
      if (filter?.featured !== undefined) params.append('featured', String(filter.featured));
      if (filter?.search) params.append('search', filter.search);

      const url = `${API_BASE}/landing-cms/media?${params.toString()}`;
      const res = await fetch(url, { cache: 'no-store', signal });
      if (!res.ok) return [];
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.data)) return json.data;
      return [];
    } catch (err: any) {
      if (err?.name === 'AbortError') return [];
      console.warn('mediaApi.getMedia fetch error:', err);
      return [];
    }
  },

  // Get single media item by ID
  async getMediaById(id: string): Promise<LandingMediaItem> {
    const url = `${API_BASE}/landing-cms/media/${id}`;
    const res = await fetch(url, { cache: 'no-store' });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Create media item
  async createMedia(itemData: Partial<LandingMediaItem>): Promise<LandingMediaItem> {
    const url = `${API_BASE}/landing-cms/media`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(itemData),
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Update media item
  async updateMedia(id: string, updates: Partial<LandingMediaItem>): Promise<LandingMediaItem> {
    const url = `${API_BASE}/landing-cms/media/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },

  // Delete media item
  async deleteMedia(id: string): Promise<{ success: boolean; message: string }> {
    const url = `${API_BASE}/landing-cms/media/${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  // Upload media file (video, audio, or pdf) to Cloudinary under Rose/Media/{Audio|Video|PDF}
  async uploadMediaFile(
    file: File,
    type: 'audio' | 'video' | 'pdf' = 'video',
  ): Promise<{ url: string; public_id: string; format: string; bytes: number; originalName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${API_BASE}/uploads/media?type=${encodeURIComponent(type)}&folder=${encodeURIComponent(type)}`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const json = await handleResponse<any>(res);
    return (json && json.data) ? json.data : json;
  },
};
