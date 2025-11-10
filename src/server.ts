import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.port, () => {
  console.log(`Server listening on http://localhost:${env.port}`);
});

process.on('SIGINT', () => server.close());
process.on('SIGTERM', () => server.close());



