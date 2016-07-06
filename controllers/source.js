import {getList} from '../services/tools';

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
    ctx.body = await getList({
      model: Model,
      params: ctx.params
    });
  },
  async count(ctx) {
    var {model: Model} = ctx.req;
    var count = await Model.count(ctx.params);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {model: Model} = ctx.req;
    var {id} = ctx.params;
    await Model.findById(id);
  }
};
