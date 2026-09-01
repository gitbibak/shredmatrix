// Generates WebP versions (full size and a 960px variant) next to every JPG/PNG
// in public/images and public/og. Originals stay as fallbacks. Run after adding
// images: npm run images:optimize
import { readdir, stat } from 'node:fs/promises';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const targets = ['public/images', 'public/og'];
const QUALITY = 78;
const SMALL_WIDTH = 960;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  }));
  return files.flat();
}

let written = 0;
for (const target of targets) {
  const files = (await walk(join(rootDir, target))).filter((file) => ['.jpg', '.jpeg', '.png'].includes(extname(file).toLowerCase()));
  for (const file of files) {
    const base = file.slice(0, -extname(file).length);
    // Always emit the 960px variant so <OptimizedImage> can rely on it; sharp
    // never enlarges, so small sources simply get a same-size copy.
    const outputs = [[`${base}.webp`, null], [`${base}-960.webp`, SMALL_WIDTH]];
    for (const [output, resizeWidth] of outputs) {
      const source = await stat(file);
      let existing = null;
      try { existing = await stat(output); } catch { /* not generated yet */ }
      if (existing && existing.mtimeMs >= source.mtimeMs) continue;
      let pipeline = sharp(file);
      if (resizeWidth) pipeline = pipeline.resize({ width: resizeWidth, withoutEnlargement: true });
      await pipeline.webp({ quality: QUALITY }).toFile(output);
      written += 1;
    }
  }
}
console.log(`WebP files written: ${written}`);
