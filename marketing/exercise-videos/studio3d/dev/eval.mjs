import { chromium } from 'playwright'; import path from 'node:path';
import { serve } from './serve.mjs';
const [ex, code] = process.argv.slice(2);
globalThis.__srv = await serve();
const b = await chromium.launch(Object.assign({ channel: 'chrome', args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--disable-gpu-vsync'] }, {}, { args: ['--ignore-gpu-blocklist', '--enable-gpu', '--use-angle=metal', '--disable-gpu-vsync'] })); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('pageerror', e => console.error('ERR', e.message));
await p.goto(globalThis.__srv.base + `player.html?ex=${ex}`); await p.waitForFunction(() => window.ready);
console.log(JSON.stringify(await p.evaluate(code), null, 1)); await b.close(); globalThis.__srv.srv.close();
