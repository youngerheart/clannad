import RestError from '../services/resterror';
import {getList, parseNull, getAggregate} from '../services/tools';
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
    var {model: Model, body: data} = ctx.req;
    if (Array.isArray(data)) {
      if (!data.length) throw new RestError(400, 'SOURCE_EMPTY_ERR', 'source array is empty');
      data = data.map(item => parseNull(item));
      var models = await Model.insertMany(data);
      ctx.body = models.map(model => ({id: model._id}));
    } else {
      var model = new Model(parseNull(data));
      await model.save();
      ctx.body = {id: model._id};
    }
  },
  async del(ctx) {
    var {model: Model} = ctx.req;
    var {params} = ctx.query;
    var {result} = await Model.remove(params ? JSON.parse(params) : {});
    if (!result.n) throw new RestError(404, 'SOURCE_NOTFOUND_ERR', 'source is not found');
  },
  async edit(ctx) {
    var {model: Model, body: data} = ctx.req;
    var {params} = ctx.query;
    var result = await Model.update(params ? JSON.parse(params) : {}, parseNull(data));
    if (!result.n) throw new RestError(404, 'SOURCE_NOTFOUND_ERR', 'source is not found');
  },
  async list(ctx) {
    var {model: Model} = ctx.req;
    var {select, ...query} = ctx.query;
    var {projectName, tableName} = ctx.params;
    select = getSelectStr(`${projectName}.${tableName}`, ctx.req.auth, select);
    ctx.body = await getList({
      model: Model,
      select,
      query
    });
  },
  async count(ctx) {
    var {model: Model} = ctx.req;
    var count = await Model.count(ctx.query);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {model: Model} = ctx.req;
    var {projectName, tableName} = ctx.params;
    var {params, select, populate} = ctx.query;
    var select = getSelectStr(`${projectName}.${tableName}`, ctx.req.auth, select);
    var source = await Model.findOne(params ? JSON.parse(params) : {}, select).populate(populate ? JSON.parse(populate) : '');
    if (!source) throw new RestError(404, 'SOURCE_NOTFOUND_ERR', 'source is not found');
    ctx.body = source;
  },
  async aggregate(ctx) {
    var {model: Model} = ctx.req;
    var {group, sort, ...query} = ctx.query;
    var {projectName, tableName} = ctx.params;
    var select = getSelectStr(`${projectName}.${tableName}`, ctx.req.auth, select);
    ctx.body = await getAggregate({
      model: Model,
      select,
      group,
      sort,
      query
    });
  }
};
