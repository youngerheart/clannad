import RestError from '../services/resterror';
import {getList, parseNull} from '../services/tools';
import {getShows} from '../services/model';

const getSelectStr = (name, auth, selectArr) => {
  if (selectArr) selectArr = JSON.parse(selectArr);
  var select = [];
  var shows = getShows(name);
  if (!auth) throw new RestError(404, 'AUTH_NOTFOUND_ERR', 'auth is not found');
  if (!shows) throw new RestError(404, 'SHOWS_NOTFOUND_ERR', `shows ${shows} is not found`);
  for (let name in shows) {
    if (selectArr && selectArr.indexOf(name) === -1) select.push(`-${name}`);
    else if (!shows[name][auth]) select.push(`-${name}`);
  }
  select = select.join(' ');
  return select + ' -__v';
};

export default {
  async add(ctx) {
    var {model: Model, body: params} = ctx.req;
    var model = new Model(parseNull(params));
    await model.save();
    ctx.body = {id: model._id};
  },
  async del(ctx) {
    var {model: Model} = ctx.req;
    var {id} = ctx.params;
    var {result} = await Model.removeById(id);
    if (!result.n) throw new RestError(404, 'SOURCE_NOTFOUND_ERR', `source ${id} is not found`);
  },
  async edit(ctx) {
    var {model: Model, body: params} = ctx.req;
    var {id} = ctx.params;
    var result = await Model.updateById(id, parseNull(params));
    if (!result.n) throw new RestError(404, 'SOURCE_NOTFOUND_ERR', `source ${id} is not found`);
  },
  async list(ctx) {
    var {model: Model} = ctx.req;
    var {projectName, tableName} = ctx.params;
    var select = getSelectStr(`${projectName}.${tableName}`, ctx.req.auth, ctx.query.select);
    ctx.body = await getList({
      model: Model,
      select,
      query: ctx.query
    });
  },
  async count(ctx) {
    var {model: Model} = ctx.req;
    var count = await Model.count(ctx.query);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {model: Model} = ctx.req;
    var {id, projectName, tableName} = ctx.params;
    var {select, populate} = ctx.query;
    var select = getSelectStr(`${projectName}.${tableName}`, ctx.req.auth, select);
    var source = await Model.findById(id, select).populate(populate ? JSON.parse(populate) : '');
    if (!source) throw new RestError(404, 'SOURCE_NOTFOUND_ERR', `source ${id} is not found`);
    ctx.body = source;
  }
};
