import Table from '../models/table';
import Field from '../models/field';
import RestError from '../services/resterror';
import {getQuery, getList} from '../services/tools';

export default {
  async add(ctx) {
    var {tableId} = ctx.params;
    var table = await Table.findById(tableId);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', `table ${tableId} is not found`);
    var query = getQuery(ctx.req.body, ['name', 'type', 'require', 'unique', 'default', 'validExp']);
    query.table = tableId;
    var field = new Field(query);
    if (!table.fields) table.fields = [];
    table.fields.push(field._id);
    await table.save();
    await field.save();
    ctx.body = {id: field._id};
  },
  async del(ctx) {
    var {id} = ctx.params;
    var field = await Field.findById(id);
    if (!field) throw new RestError(404, 'FIELD_NOTFOUND_ERR', `field ${id} is not found`);
    var table = await Table.findById(field.table);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', `table ${field.table} is not found`);
    table.fields.splice(table.fields.indexOf(id), 1);
    await table.save();
    await field.remove();
  },
  async edit(ctx) {
    var {id} = ctx.params;
    var query = getQuery(ctx.req.body, ['name', 'type', 'require', 'unique', 'default', 'validExp']);
    await Field.updateById(id, query);
  },
  async list(ctx) {
    ctx.body = await getList({
      model: Field,
      params: ctx.params
    });
  },
  async count(ctx) {
    var count = Field.find(ctx.params);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {id} = ctx.params;
    var field = await Field.findById(id);
    if (!field) throw new RestError(404, 'FIELD_NOTFOUND_ERR', `field ${id} is not found`);
    ctx.body = field;
  }
};
