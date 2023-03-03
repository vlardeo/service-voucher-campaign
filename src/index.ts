import server from './server';
import env from './env';

const port = Number(env.SERVER_PORT) || 3000;

(async () => {
  server.listen(port, () => console.log(`Running on port: ${port}`));
})();
