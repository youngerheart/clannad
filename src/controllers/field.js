import Table from '../models/table';
import Field from '../models/field';
import RestError from '../services/resterror';
import {removeCaches} from '../services/model';
import {getQuery, getList, parseNull} from '../services/tools';

const select = '-__v -table';
const getFieldQuery = (params) => {
  var quertArr = ['name', 'type', 'required', 'unique', 'default', 'show', 'validExp', 'index', 'ref'];
  if (params.type !== 'ObjectId' && params.type !== 'ObjectIdArray') params.ref = null;
  return getQuery(params, quertArr);
};

export default {
  async add(ctx) {
    var {id} = ctx.params;
    var table = await Table.findById(id);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', `table ${id} is not found`);
    if (ctx.req.body.type);
    var query = getFieldQuery(ctx.req.body);
    // 一个表中的字段不可重复
    var field = await Field.findOne({table: id, name: query.name});
    if (field) throw new RestError(400, 'FIELD_EXIST_ERR', `field ${query.name} is existed in table ${table.name}`);
    query.table = id;
    field = new Field(query);
    if (!table.fields) table.fields = [];
    table.fields.push(field._id);
    await field.save();
    await table.save();
    ctx.body = {id: field._id};
  },
  async del(ctx) {
    var {id, projectName} = ctx.params;
    var field = await Field.findById(id).populate('table');
    if (!field) throw new RestError(404, 'FIELD_NOTFOUND_ERR', `field ${id} is not found`);
    await Table.editField({_id: field.table._id}, 'fields', id);
    await removeCaches(field, projectName, field.table.name);
    await field.remove();
  },
  async edit(ctx) {
    var {id} = ctx.params;
    var query = parseNull(getFieldQuery(ctx.req.body));
    var field = await Field.findById(id);
    var table = await Table.findById(field.table);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', `table ${field.table} is not found`);
    for (let key in query) {field[key] = query[key];}
    await field.save();
  },
  async list(ctx) {
    var {id: table} = ctx.params;
    var query = {...ctx.query, table};
    ctx.body = await getList({
      model: Field,
      select,
      query
    });
  },
  async count(ctx) {
    var query = {table: ctx.params.id, ...ctx.query};
    var count = await Field.count(query);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {id} = ctx.params;
    var field = await Field.findById(id, select);
    if (!field) throw new RestError(404, 'FIELD_NOTFOUND_ERR', `field ${id} is not found`);
    ctx.body = field;
  }
};
