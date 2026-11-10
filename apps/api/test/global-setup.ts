// Builds the encrypted MEGA fixtures once per test run (reused when already built).
import { execFileSync } from 'node:child_process';
import path from 'node:path';

export default function setup(): void {
  execFileSync(process.execPath, [path.resolve(__dirname, 'mega/fixtures/build.mjs')], { stdio: ['ignore', 'ignore', 'inherit'] });
}
