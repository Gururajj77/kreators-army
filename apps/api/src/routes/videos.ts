import type { AdminVideo, Video, VideoAspect, VideoListResponse, VideoSource } from '@kreators/shared';
import { Hono } from 'hono';
import type { AppEnv } from '../env';

export interface VideoRow {
  id: string;
  title: string;
  brand: string;
  category: string | null;
  platform: string | null;
  source: VideoSource;
  ref: string;
  aspect: VideoAspect;
  poster_url: string | null;
  views: number;
  featured: number;
  sort_order: number;
  published: number;
  created_at: string;
  updated_at: string;
}

export function toVideo(row: VideoRow): Video {
  return {
    id: row.id,
    title: row.title,
    brand: row.brand,
    category: row.category,
    platform: row.platform,
    source: row.source,
    ref: row.ref,
    aspect: row.aspect,
    posterUrl: row.poster_url,
    views: row.views,
    featured: row.featured === 1,
  };
}

export function toAdminVideo(row: VideoRow): AdminVideo {
  return { ...toVideo(row), sortOrder: row.sort_order, published: row.published === 1, createdAt: row.created_at, updatedAt: row.updated_at };
}

export const videos = new Hono<AppEnv>();

// Filtering happens in the browser: the catalogue is small, and it makes every filter instant and every filtered view a shareable address.
videos.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM videos WHERE published = 1 ORDER BY sort_order ASC, views DESC LIMIT 500').all<VideoRow>();
  c.header('Cache-Control', 'public, max-age=60');
  return c.json<VideoListResponse>({ videos: results.map(toVideo) });
});
