import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bundledServer = path.resolve(__dirname, 'dist-server', 'index.js');

if (fs.existsSync(bundledServer)) {
  // Production bundled server exists - load it directly with zero overhead
  await import('./dist-server/index.js');
} else if (process.execArgv.some((a) => a.includes('tsx')) || process.env.__TSX_SPAWNED__) {
  // Running under tsx (development mode)
  await import('./src/server/entry.ts');
} else {
  // Plain node without tsx - re-exec with tsx loader
  const child = spawn(process.execPath, ['--import', 'tsx', __filename], {
    stdio: 'inherit',
    env: { ...process.env, __TSX_SPAWNED__: '1' },
  });
  child.on('exit', (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    process.exit(code ?? 0);
  });
}
