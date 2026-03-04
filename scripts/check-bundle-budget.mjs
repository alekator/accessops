import fs from 'node:fs';
import path from 'node:path';

const CHUNKS_DIR = path.join(process.cwd(), '.next', 'static', 'chunks');
const MAX_TOTAL_JS_BYTES = 1500 * 1024;
const MAX_SINGLE_CHUNK_BYTES = 350 * 1024;

function collectJsFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectJsFiles(fullPath));
    } else if (entry.isFile() && fullPath.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const jsFiles = collectJsFiles(CHUNKS_DIR);
if (jsFiles.length === 0) {
  console.error('Bundle budget check failed: no JS chunks found. Run `pnpm build` first.');
  process.exit(1);
}

const sizes = jsFiles.map((file) => ({
  file,
  size: fs.statSync(file).size,
}));

const total = sizes.reduce((acc, item) => acc + item.size, 0);
const largest = sizes.reduce((acc, item) => (item.size > acc.size ? item : acc), sizes[0]);

console.log(`Bundle size report: ${jsFiles.length} chunks`);
console.log(`Total JS size: ${(total / 1024).toFixed(1)} KB`);
console.log(`Largest chunk: ${path.relative(process.cwd(), largest.file)} ${(largest.size / 1024).toFixed(1)} KB`);

if (total > MAX_TOTAL_JS_BYTES) {
  console.error(
    `Bundle budget exceeded: total ${(total / 1024).toFixed(1)} KB > ${(MAX_TOTAL_JS_BYTES / 1024).toFixed(1)} KB`,
  );
  process.exit(1);
}

if (largest.size > MAX_SINGLE_CHUNK_BYTES) {
  console.error(
    `Bundle budget exceeded: largest ${(largest.size / 1024).toFixed(1)} KB > ${(MAX_SINGLE_CHUNK_BYTES / 1024).toFixed(1)} KB`,
  );
  process.exit(1);
}

console.log('Bundle budget check passed.');
