/**
 * Serves /media/ files with byte ranges. Workers static assets answer a Range request with the whole file, and Safari will not
 * play a video from a server that does that, so the Worker cuts out the requested bytes itself.
 */
export async function serveMedia(req: Request, assets: Fetcher): Promise<Response> {
  const res = await assets.fetch(req);
  if (res.status !== 200) return res;

  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Cache-Control', 'public, max-age=86400');

  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get('Range')?.trim() ?? '');
  if (!range || (!range[1] && !range[2])) return new Response(res.body, { status: 200, headers });

  const body = await res.arrayBuffer();
  const size = body.byteLength;
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;

  if (start >= size || start > end) {
    headers.set('Content-Range', `bytes */${size}`);
    headers.delete('Content-Length');
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(body.slice(start, end + 1), { status: 206, headers });
}
