import Fastify from 'fastify';
import cors from 'fastify-cors';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT || 4000);
const ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

async function main() {
  const app = Fastify({ logger: true });
  app.register(cors, { origin: ORIGIN, credentials: true });

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
