import Table from '../schemas/table';
import RestError from '../services/resterror';
import {getQuery, getList} from '../services/tools';

export default {
  async add(ctx) {
    var {projectId, name} = ctx.req.body;
    var projectId = await getProjectId(projectName);
    var table = new Table({name, project: projectId});
    await table.save();
    ctx.body = table._id;
  },
  async del(ctx) {
    var {id} = ctx.params;
    var table = await Table.getById(id);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', `table ${projectName}.${tableName} is not found`);
    await table.remove();
  },
  async edit(ctx) {
    var {id} = ctx.params;
    var query = getQuery(ctx.req.body, ['adminAuth', 'userAuth', 'name']);
    var table = await Table.getById(id);
    for (let key in query) {table[key] = query[key];};
    await table.save();
  },
  async list(ctx) {
    var {project: projectName} = ctx.params;
    var projectId = await getProjectId(projectName);
    ctx.params.project = projectId;
    ctx.body = await getList(Table, ctx.params);
  },
  async count(ctx) {
    var {project: projectName} = ctx.params;
    ctx.params.project = await getProjectId(projectName);
    var count = await Table.count(ctx.params);
    ctx.body = {count};
  },
  async get(ctx) {
    var {project: projectName, table: tableName} = ctx.params;
    var projectId = await getProjectId(projectName);
    ctx.body = await getTable(projectId, tableName);
  },
  async getSchema(ctx) {}
};
