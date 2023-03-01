import server from './server';
import env from './env';

const port = Number(env.SERVER_PORT);

(async () => {
  server.listen(port, () => console.log(`Running on port: ${port}`));
})();
