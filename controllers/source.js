import RestError from '../services/resterror';
import {getList} from '../services/tools';
import {getShows} from '../services/model';

const getSelectStr = (name, auth) => {
  var select = [];
  var shows = getShows(name);
  // console.log(name, auth);
  if (!auth) throw new RestError(404, 'AUTH_NOTFOUND_ERR', 'auth is not found');
  if (!shows) throw new RestError(404, 'SHOWS_NOTFOUND_ERR', `shows ${shows} is not found`);
  for (let name in shows) {
    if (shows[name][auth]) select.push(name);
  }
  return select.join(' ');
};

export default {
  async add(ctx) {
    var {model: Model, body: params} = ctx.req;
    var model = new Model(params);
    await model.save();
    ctx.body = {id: model._id};
  },
  async del(ctx) {
    var {model: Model} = ctx.req;
    var {id} = ctx.params;
    await Model.removeById(id);
  },
  async edit(ctx) {
    var {model: Model, body: params} = ctx.req;
    var {id} = ctx.params;
    await Model.updateById(id, params);
  },
  async list(ctx) {
    var {model: Model} = ctx.req;
    var {projectName, tableName} = ctx.params;
    var select = getSelectStr(`${projectName}.${tableName}`, ctx.req.auth);
    select = select ? select + ' -__v' : '_id createdAt updatedAt';
    delete ctx.params.projectName;
    delete ctx.params.tableName;
    ctx.body = await getList({
      model: Model,
      params: ctx.params,
      select
    });
  },
  async count(ctx) {
    var {model: Model} = ctx.req;
    var count = await Model.count(ctx.params);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {model: Model} = ctx.req;
    var {id, projectName, tableName} = ctx.params;
    var select = getSelectStr(`${projectName}.${tableName}`, ctx.req.auth);
    var source = await Model.findById(id, select);
    if (!source) throw new RestError(404, 'SOURCE_NOTFOUND_ERR', `source ${id} is not found`);
    ctx.body = source;
  }
};
