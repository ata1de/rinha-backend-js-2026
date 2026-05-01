const K = 5;
const DIMS = 14;

export function knn5(queryVec, vectors, labels, count) {
  const heapDist  = new Float64Array(K).fill(Infinity);
  const heapLabel = new Uint8Array(K);

  let maxDist = Infinity;
  let maxIdx  = 0;

  for (let i = 0; i < count; i++) {
    const offset = i * DIMS;
    let dist = 0;

    for (let d = 0; d < DIMS; d++) {
      const diff = queryVec[d] - vectors[offset + d];
      dist += diff * diff;

      if (dist >= maxDist) break;
    }

    if (dist < maxDist) {
      heapDist[maxIdx]  = dist;
      heapLabel[maxIdx] = labels[i];

      // Só refaz o scan quando o heap muda
      maxDist = heapDist[0];
      maxIdx  = 0;

      for (let j = 1; j < K; j++) {
        if (heapDist[j] > maxDist) {
          maxDist = heapDist[j];
          maxIdx  = j;
        }
      }
    }
  }

  let fraudCount = 0;
  for (let j = 0; j < K; j++) fraudCount += heapLabel[j];

  return fraudCount / K;
}