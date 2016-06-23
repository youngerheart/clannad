import Koa from 'koa';

import Routes from './routes';
import Auth from './controllers/auth';

const app = new Koa();

app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

app.use(Routes.routes());

export default {
  auth(callback) {
    Auth.check = callback;
  },
  start(port) {
    app.listen(port, () => {
      process.stderr.write(`Server running at http://localhost:${port}\n`);
    });
  }
};
