import { chromium } from 'playwright';
import path from 'node:path';
const [file, out, w = 1800, h = 1400] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: +w, height: +h } });
p.on('pageerror', e => console.error('ERR', e.message)); p.on('console', m => console.log('log', m.text()));
await p.goto('file://' + path.resolve(file)); await p.waitForFunction(() => window.ready);
await p.screenshot({ path: out }); await b.close();
