// (pv) A small D1 stand-in over node:sqlite, with every migration applied, so route tests can run the real Worker (src/index.ts)
// end to end in Node: prepare/bind/first/all/run/raw and batch (one transaction), BLOBs as Uint8Array. Not a full D1: enough
// for the statements the Worker sends. Plus a fake caches.default keyed by URL.
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

const MIGRATIONS = path.resolve(__dirname, '../migrations');

type Value = SQLInputValue;

class Stmt {
  constructor(
    readonly db: DatabaseSync,
    readonly sql: string,
    readonly args: Value[] = [],
  ) {}
  bind(...args: unknown[]): Stmt {
    return new Stmt(
      this.db,
      this.sql,
      args.map((a) => (a === undefined ? null : typeof a === 'boolean' ? Number(a) : (a as Value))),
    );
  }
  private exec() {
    const s = this.db.prepare(this.sql);
    return s;
  }
  async first<T>(col?: string): Promise<T | null> {
    const row = this.exec().get(...this.args) as Record<string, unknown> | undefined;
    if (!row) return null;
    return (col ? row[col] : { ...row }) as T;
  }
  async all<T>(): Promise<{ results: T[]; success: true; meta: { changes: number } }> {
    const rows = this.exec().all(...this.args) as T[];
    return { results: rows.map((r) => ({ ...(r as object) }) as T), success: true, meta: { changes: 0 } };
  }
  async run(): Promise<{ success: true; meta: { changes: number; last_row_id: number } }> {
    const r = this.exec().run(...this.args);
    return { success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
  async raw<T>(): Promise<T[]> {
    const s = this.exec();
    s.setReturnArrays?.(true);
    return s.all(...this.args) as T[];
  }
  /** For batch: run or all, by statement kind. */
  runSync() {
    const s = this.exec();
    if (/^\s*(select|with)\b/i.test(this.sql) || /\breturning\b/i.test(this.sql)) return { results: (s.all(...this.args) as object[]).map((r) => ({ ...r })), success: true, meta: { changes: 0 } };
    const r = s.run(...this.args);
    return { results: [], success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
}

export function makeD1() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  for (const f of fs.readdirSync(MIGRATIONS).filter((x) => x.endsWith('.sql')).sort()) db.exec(fs.readFileSync(path.join(MIGRATIONS, f), 'utf8'));
  const d1 = {
    prepare: (sql: string) => new Stmt(db, sql),
    async batch(stmts: Stmt[]) {
      db.exec('BEGIN');
      try {
        const out = stmts.map((s) => s.runSync());
        db.exec('COMMIT');
        return out;
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },
    async exec(sql: string) {
      db.exec(sql);
      return { count: 1, duration: 0 };
    },
  };
  return { d1: d1 as unknown as D1Database, db };
}

/** caches.default for Node: whole responses by URL; `puts` lists every key written. */
export function installFakeCache() {
  const store = new Map<string, { body: ArrayBuffer; headers: [string, string][]; status: number }>();
  const puts: string[] = [];
  const keyOf = (r: Request | string) => (typeof r === 'string' ? r : r.url);
  const cache = {
    async match(r: Request | string) {
      const hit = store.get(keyOf(r));
      return hit ? new Response(hit.body.slice(0), { status: hit.status, headers: hit.headers }) : undefined;
    },
    async put(r: Request | string, res: Response) {
      puts.push(keyOf(r));
      store.set(keyOf(r), { body: await res.arrayBuffer(), headers: [...res.headers], status: res.status });
    },
    async delete(r: Request | string) {
      return store.delete(keyOf(r));
    },
  };
  (globalThis as unknown as { caches: unknown }).caches = { default: cache };
  return { store, puts };
}
