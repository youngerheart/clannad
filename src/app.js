import Koa from 'koa';
import mongoose from 'mongoose';
import parse from 'co-body';
import Router from 'koa-router';

import Routes from './routes';
import Auth from './controllers/auth';
import Table from './controllers/table';
import RestError from './services/resterror';

const app = new Koa();
const userRouters = new Router();

mongoose.Promise = Promise;

app.use(async (ctx, next) => {
  const start = new Date();
  ctx.type = 'json';
  try {
    if (ctx.method === 'OPTIONS') {
      await Auth.setCORS(ctx, true);
      ctx.status = 200;
    }
    // 直接解析出post参数, 这里的co-body 的 parse 总是有神奇的 bug
    var getBody = async () => {
      let type = ctx.headers['content-type'];
      if (type.indexOf('application/json') > -1)
        ctx.req.body = await parse.json(ctx) || {};
      else if (type.indexOf('application/x-www-from-urlencoded') > -1)
        ctx.req.body = await parse.form(ctx) || {};
      else ctx.req.body = await parse(ctx) || {};
    };
    if (ctx.method !== 'GET' && ctx.method !== 'OPTIONS') await getBody();
    await next();
    if (ctx.body) ctx.status = 200;
    else if (ctx.params) ctx.status = 204;
    // 处理报错情况
    else throw new RestError(ctx.status, 'ROUTER_ERR', ctx.response.message);
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
app.use(userRouters.routes());

export default {
  app,
  auth(callback, name = 'REST') {
    Auth.name = name;
    Auth.check = callback;
  },
  configDB(callback) {
    callback(mongoose);
  },
  router: userRouters
};
