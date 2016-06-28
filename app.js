import Koa from 'koa';
import mongoose from 'mongoose';
import parse from 'co-body';

import Routes from './routes';
import Auth from './controllers/auth';
import RestError from './services/resterror';

const app = new Koa();

mongoose.Promise = Promise;

app.use(async (ctx, next) => {
  const start = new Date();
  // 直接解析出post参数
  if (ctx.method !== 'GET') ctx.req.body = await parse(ctx) || {};
  ctx.type = 'json';
  try {
    await next();
  } catch (err) {
    if (err.status) {
      process.stderr.write(err.message + '\n');
      let {status, name, message} = err;
      ctx.status = status;
      ctx.body = {name, message};
    } else {
      process.stderr.write(err + '\n');
      ctx.status = 500;
      ctx.body = {
        name: 'SERVER_ERROR',
        message: err
      };
    }
  }
  const ms = new Date() - start;
  process.stderr.write(`${ctx.method} ${ctx.url} - ${ms}ms\n`);
});

app.use(Routes.routes());

export default {
  auth(callback) {
    Auth.check = callback;
  },
  configDB(callback) {
    callback(mongoose);
  },
  start(port) {
    app.listen(port, () => {
      process.stderr.write(`Server running at http://localhost:${port}\n`);
    });
  }
};