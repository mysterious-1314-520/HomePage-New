const Fastify = require('fastify');
const path = require('path');

const PORT = process.env.PORT || 4000;
const ROOT_DIR = path.join(__dirname, '..');

const fastify = Fastify({ logger: false });

fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } });
fastify.register(require('@fastify/static'), {
  root: ROOT_DIR,
  prefix: '/',
  decorateReply: false
});

// API routes
fastify.register(require('./routes/api'));

// SPA fallback: serve index.html for non-file routes
fastify.setNotFoundHandler((req, reply) => {
  if (req.url.startsWith('/api/')) {
    return reply.code(404).send({ code: 404, msg: 'Not found' });
  }
  if (req.url.startsWith('/admin') && !req.url.includes('.')) {
    return reply.sendFile('admin/index.html');
  }
  // Check if it looks like a file request
  if (req.url.includes('.')) {
    return reply.code(404).send('Not found');
  }
  return reply.sendFile('index.html');
});

fastify.addHook('onSend', (request, reply, payload, done) => {
  if (!request.url.startsWith('/api/')) {
    reply.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  done();
});

fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, addr) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`[Server] Listening on http://0.0.0.0:${PORT}`);
});
