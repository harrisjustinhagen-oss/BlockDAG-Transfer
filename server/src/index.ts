import Fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001', 
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5173',
  'http://127.0.0.1:3000'
];

async function main() {
  const app = Fastify({ logger: true });
  app.register(cors, { 
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'), false);
      }
    },
    credentials: true 
  });

  await registerRoutes(app);

  try {
    await app.listen(PORT, '0.0.0.0');
    app.log.info(`Server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

main();
