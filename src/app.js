import Koa from 'koa';
import mongoose from 'mongoose';
import parse from 'co-body';

import Routes from './routes';
import Auth from './controllers/auth';
import {getCORS} from './services/model';

const app = new Koa();

mongoose.Promise = Promise;

app.use(async (ctx, next) => {
  const start = new Date();
  // 直接解析出post参数
  if (ctx.method !== 'GET') {
    ctx.req.body = await parse.json(ctx) ||
    await parse.form(ctx) || await parse(ctx) || {};
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
  // add cors
  if (ctx.params) {
    var cors = getCORS(ctx.params.projectName);
    ctx.set({
      'access-control-allow-credentials': true,
      'access-control-allow-headers': 'X-Requested-With, Content-Type, X-Token',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'access-control-allow-origin': cors && cors.length ? cors.join(', ') : '*'
    });
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
