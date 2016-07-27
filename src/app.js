import Koa from 'koa';
import mongoose from 'mongoose';
import parse from 'co-body';

import Routes from './routes';
import Auth from './controllers/auth';

const app = new Koa();

mongoose.Promise = Promise;

app.use(async (ctx, next) => {
  const start = new Date();
  // 直接解析出post参数
  if (ctx.method !== 'GET') {
    ctx.req.body = await parse.json(ctx) ||
    await parse.form(ctx) || await parse(ctx) || {};
  }
  if (ctx.method === 'OPTIONS') {
    ctx.status = 200;
    Auth.setCORS(ctx, true);
  }
  ctx.type = 'json';
  try {
    await next();
    if (ctx.body) ctx.status = 200;
    else if (ctx.params) ctx.status = 204;
  } catch (err) {
    process.stderr.write(err + '\n');
    let {status, name, message, errors} = err;
    ctx.status = status || 500;
    if (name) ctx.body = {name, message, errors};
  }
  const ms = new Date() - start;
  process.stderr.write(`${ctx.method} ${ctx.url} - ${ms}ms\n`);
});

app.use(Routes.routes());

export default {
  app,
  auth(callback, name = 'REST') {
    Auth.name = name;
    Auth.check = callback;
  },
  configDB(callback) {
    callback(mongoose);
  }
};
