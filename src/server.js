import Fastify from 'fastify';
import { loadDataset } from './dataset.js';
import { vectorize } from './vectorize.js';
import { knn5 } from './knn.js';

const fastify = Fastify({ logger: false });

let refs;

fastify.addHook('onReady', async () => {
  refs = await loadDataset();
});

fastify.get('/ready', (_, reply) => {
  if (refs) {
    reply.send({ ok: true });
  } else {
    reply.code(503).send();
  }
});

fastify.post('/fraud-score', (req) => {
  const bodyVectorized = vectorize(req.body);
  const fraud_score = knn5(bodyVectorized, refs.vectors, refs.labels, refs.count);

  return { approved: fraud_score < 0.6, fraud_score };
});

fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
