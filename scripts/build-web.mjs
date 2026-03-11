import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const rootDir = process.cwd();
const outputDir = join(rootDir, 'www');

const filesToCopy = [
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'service-worker.js'
];

rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

for (const file of filesToCopy) {
  cpSync(join(rootDir, file), join(outputDir, file));
}

if (existsSync(join(rootDir, 'icons'))) {
  cpSync(join(rootDir, 'icons'), join(outputDir, 'icons'), { recursive: true });
}

console.log('Built web assets into ./www');
