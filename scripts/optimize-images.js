#!/usr/bin/env node

/*
  Image optimization script
  - Converts images in public/assets and public/images to WebP and AVIF
  - Keeps original files, writes optimized versions alongside with same name but different extension
  - Uses sharp
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const roots = [
  path.join(__dirname, '..', 'public', 'assets'),
  path.join(__dirname, '..', 'public', 'images'),
];

const exts = ['.jpg', '.jpeg', '.png', '.webp', '.tiff', '.gif', '.avif'];

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const base = file.slice(0, -ext.length);
  const outWebP = `${base}.webp`;
  const outAvif = `${base}.avif`;

  try {
    const input = fs.readFileSync(file);
    // Skip if source is already avif or webp? still process for better quality
    await sharp(input)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outWebP);

    await sharp(input)
      .rotate()
      .resize({ width: 1920, withoutEnlargement: true })
      .avif({ quality: 50 })
      .toFile(outAvif);

    console.log(`Optimized: ${file} -> ${path.basename(outWebP)}, ${path.basename(outAvif)}`);
  } catch (err) {
    console.error(`Failed processing ${file}:`, err.message);
  }
}

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir);
  list.forEach((item) => {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      walk(full, files);
    } else {
      files.push(full);
    }
  });
  return files;
}

(async () => {
  for (const root of roots) {
    const files = walk(root);
    const images = files.filter(f => exts.includes(path.extname(f).toLowerCase()));
    for (const img of images) {
      await processFile(img);
    }
  }
  console.log('Image optimization complete.');
})();
