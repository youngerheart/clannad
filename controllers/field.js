import Table from '../models/table';
import Field from '../models/field';
import RestError from '../services/resterror';
import {setCache, removeCaches} from '../services/model';
import {getQuery, getList} from '../services/tools';

const select = '-__v -table';

export default {
  async add(ctx) {
    var {id, projectName} = ctx.params;
    var table = await Table.findById(id);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', `table ${id} is not found`);
    var query = getQuery(ctx.req.body, ['name', 'type', 'require', 'unique', 'default', 'validExp']);
    query.table = id;
    var field = new Field(query);
    if (!table.fields) table.fields = [];
    table.fields.push(field._id);
    await field.save();
    await table.save();
    setCache(field, projectName, table.name);
    ctx.body = {id: field._id};
  },
  async del(ctx) {
    var {id, projectName} = ctx.params;
    var field = await Field.findById(id);
    if (!field) throw new RestError(404, 'FIELD_NOTFOUND_ERR', `field ${id} is not found`);
    var table = await Table.findById(field.table);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', `table ${field.table} is not found`);
    table.fields.splice(table.fields.indexOf(id), 1);
    await removeCaches(field, projectName, table.name);
    await field.remove();
    await table.save();
  },
  async edit(ctx) {
    var {id, projectName} = ctx.params;
    var query = getQuery(ctx.req.body, ['name', 'type', 'require', 'unique', 'default', 'validExp']);
    var field = await Field.findById(id);
    for (let key in query) {field[key] = query[key];}
    await field.save();
    await setCache(field, projectName);
  },
  async list(ctx) {
    delete ctx.params.projectName;
    var {id: table, others} = ctx.params;
    var params = {...others, table};
    ctx.body = await getList({
      model: Field,
      params,
      select
    });
  },
  async count(ctx) {
    var count = Field.find(ctx.params);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {id} = ctx.params;
    var field = await Field.findById(id, select);
    if (!field) throw new RestError(404, 'FIELD_NOTFOUND_ERR', `field ${id} is not found`);
    ctx.body = field;
  }
};
