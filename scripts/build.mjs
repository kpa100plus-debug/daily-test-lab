import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');
const sourceDirectory = path.join(projectRoot, 'src', 'site');
const contentDirectory = path.join(projectRoot, 'src', 'content');
const outputDirectory = path.join(projectRoot, 'dist');

const contentFiles = [
  'tests.json',
  'balance-games.json',
  'daily-content.json'
];

for (const fileName of contentFiles) {
  const filePath = path.join(contentDirectory, fileName);
  JSON.parse(await readFile(filePath, 'utf8'));
}

await rm(outputDirectory, { recursive: true, force: true });
await mkdir(outputDirectory, { recursive: true });
await cp(sourceDirectory, outputDirectory, { recursive: true });
await mkdir(path.join(outputDirectory, 'data'), { recursive: true });

for (const fileName of contentFiles) {
  await cp(
    path.join(contentDirectory, fileName),
    path.join(outputDirectory, 'data', fileName)
  );
}

await writeFile(
  path.join(outputDirectory, 'build-meta.json'),
  `${JSON.stringify({ service: 'DAILY TEST LAB', build: 'step-1' }, null, 2)}\n`,
  'utf8'
);

console.log('Build complete: dist/');

