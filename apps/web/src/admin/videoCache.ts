// Owner: A4 Admin. Keeping the TanStack caches of the videos list, the bin and one video in step after a write, and the delete-with-Undo both the list
// and the drawer use (admin brief 5.4: "Deleted “{title}”. [Undo]" for 8 s; Undo restores with the previous published value).
import type { AdminVideo, AdminVideoList } from '@kreators/shared';
import type { QueryClient } from '@tanstack/react-query';
import { AdminApiError, adminApi, keys } from './api';
import { toast } from './Toasts';

/** Put a changed, new or binned video into both list caches and its own, without a refetch. */
export function mergeVideo(qc: QueryClient, video: AdminVideo) {
  const binned = !!video.deletedAt;
  qc.setQueryData<AdminVideoList>(keys.videos(false), (old) => {
    if (!old) return old;
    const wasThere = old.videos.some((v) => v.id === video.id);
    const rest = old.videos.filter((v) => v.id !== video.id);
    const videos = binned ? rest : [...rest, video].sort((a, b) => a.sortOrder - b.sortOrder || b.views - a.views);
    return {
      ...old,
      videos,
      legacySecretCount: videos.filter((v) => v.mega?.keyIn === 'secret').length,
      binCount: old.binCount + (binned && wasThere ? 1 : 0),
    };
  });
  qc.setQueryData<AdminVideoList>(keys.videos(true), (old) => {
    if (!old) return old;
    const rest = old.videos.filter((v) => v.id !== video.id);
    const videos = binned ? [video, ...rest] : rest;
    return { ...old, videos, binCount: videos.length };
  });
  qc.setQueryData(keys.video(video.id), video);
}

/** (sel) Takes a video out of both list caches and its own (purged, or gone on the server). */
export function forgetVideo(qc: QueryClient, id: string) {
  qc.setQueryData<AdminVideoList>(keys.videos(false), (old) => {
    if (!old || !old.videos.some((v) => v.id === id)) return old;
    const videos = old.videos.filter((v) => v.id !== id);
    return { ...old, videos, legacySecretCount: videos.filter((v) => v.mega?.keyIn === 'secret').length };
  });
  qc.setQueryData<AdminVideoList>(keys.videos(true), (old) => {
    if (!old || !old.videos.some((v) => v.id === id)) return old;
    const videos = old.videos.filter((v) => v.id !== id);
    return { ...old, videos, binCount: videos.length };
  });
  qc.removeQueries({ queryKey: keys.video(id), exact: true });
}

/** V5, then a toast with Undo (V6 with the previous published value). Resolves true when the video went to the bin. */
export async function deleteWithUndo(qc: QueryClient, v: AdminVideo): Promise<boolean> {
  try {
    const after = await adminApi.deleteVideo(v.id);
    mergeVideo(qc, after);
  } catch (e) {
    if (e instanceof AdminApiError && e.code !== 'server') toast(e.message, { tone: 'error' });
    return false;
  }
  toast(`Deleted “${v.title}”.`, {
    action: {
      label: 'Undo',
      run: async () => {
        try {
          const back = await adminApi.restoreVideo(v.id, v.published);
          mergeVideo(qc, back);
          await qc.invalidateQueries({ queryKey: keys.videos(false) });
          toast(`Restored “${v.title}”.`);
        } catch (e) {
          toast(e instanceof AdminApiError ? e.message : "Couldn't restore it.", { tone: 'error' });
        }
      },
    },
  });
  return true;
}
