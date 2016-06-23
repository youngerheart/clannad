import Koa from 'koa';

import Routes from './routes';

const app = new Koa();

app.use(Routes.routes());

app.listen(3000, () => {
  process.stderr.write('Server running at http://localhost:3000\n');
});

export default app;
