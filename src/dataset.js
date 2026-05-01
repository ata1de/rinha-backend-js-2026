import { createReadStream } from 'node:fs';
import { createGunzip } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadDataset() {
  const path = resolve(__dirname, '..', 'resources', 'references.json.gz');

  const chunks = [];

  await new Promise((resolve, reject) => {
    createReadStream(path)
      .pipe(createGunzip())
      .on('data', (chunk) => chunks.push(chunk))
      .on('end', resolve)
      .on('error', reject);
  });

  const data = JSON.parse(Buffer.concat(chunks).toString());
  const count = data.length;
  const DIMS = 16;
  const vectors = new Float32Array(count * DIMS);
  const labels = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    const entry = data[i];

    const vec = entry.vector;

    const offset = i * DIMS;

    for (let d = 0; d < 14; d++) {
      vectors[offset + d] = vec[d];
    }

    labels[i] = entry.label === 'fraud' ? 1 : 0;
  }

  return { vectors, labels, count, DIMS };
}
