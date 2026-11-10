// Shared by the MEGA tests: the fixture metadata and a mock MEGA on a free port, always stopped after the suite.
import { spawn, type ChildProcess } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const OUT = path.resolve(__dirname, '.out');
export const meta = JSON.parse(fs.readFileSync(path.join(OUT, 'meta.json'), 'utf8'));
export const MEDIA = path.resolve(__dirname, '../../../web/public/media');

export interface Mock {
  base: string;
  origin: string;
  stop(): Promise<void>;
  ctl(p: string, body?: object): Promise<any>;
  stats(): Promise<any>;
}

export async function startMock(): Promise<Mock> {
  const child: ChildProcess = spawn(process.execPath, [path.resolve(__dirname, 'mock-mega.mjs'), '--fixture', OUT, '--port', '0'], { stdio: ['ignore', 'pipe', 'inherit'] });
  const line: string = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.stdout!.once('data', (d) => resolve(String(d)));
  });
  const origin = /http:\/\/127\.0\.0\.1:\d+/.exec(line)![0];
  const base = `${origin}/`;
  return {
    base,
    origin,
    stop: () =>
      new Promise((r) => {
        if (child.exitCode !== null) return r();
        child.once('exit', () => r());
        child.kill('SIGTERM');
      }),
    ctl: (p, body) => fetch(base + p, { method: 'POST', body: body ? JSON.stringify(body) : undefined }).then((r) => r.json()),
    stats: () => fetch(`${base}__stats?log`).then((r) => r.json()),
  };
}

/** A Cache API stand-in (Map of ArrayBuffers) with the two calls the stream makes. */
export class MemCache {
  store = new Map<string, ArrayBuffer>();
  puts = 0;
  async match(key: string) {
    const b = this.store.get(key);
    return b ? new Response(b.slice(0), { headers: { 'Content-Length': String(b.byteLength) } }) : undefined;
  }
  async put(key: string, res: Response) {
    this.puts++;
    this.store.set(key, await res.arrayBuffer());
  }
}
