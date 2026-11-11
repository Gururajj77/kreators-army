/**
 * What is left of the MEGA stream's row lookup (Nov 2026): the Worker no longer streams MEGA (Cloudflare's free plan stops a request after
 * 10 ms of CPU, and decrypting a range took longer). The public plays MEGA's own embed; /media/v/<id>.mp4 and /media/mega-<h>.mp4 answer
 * 410 Gone (src/index.ts). What stays: reading a legacy row's key from the MEGA_LINKS secret (the public embed address and the admin's
 * "adopt key"), and forgetRows() for the admin writes that still call it.
 */
import { findMegaLinks } from '@kreators/shared';

/**
 * Admin writes call this after every change. The stream's per-isolate row cache it used to clear is gone with the stream, so there is
 * nothing to forget any more; it stays so those callers keep compiling and can drop the call at leisure.
 */
export function forgetRows(): void {}

/** The key of a legacy row from the MEGA_LINKS secret: only a plain file link whose handle matches. */
export function keyFromSecret(handle: string, links: string | undefined): string | null {
  if (!links) return null;
  for (const found of findMegaLinks(links)) if (found.ok && found.link.kind === 'file' && found.link.handle === handle) return found.link.key43;
  return null;
}
