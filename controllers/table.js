import Project from '../models/project';
import Table from '../models/table';
import RestError from '../services/resterror';
import {getQuery, getList, models} from '../services/tools';

export default {
  async add(ctx) {
    var {name} = ctx.req.body;
    var {projectName} = ctx.params;
    var project = await Project.find({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    var table = new Table({name, project: project.Id});
    project.tables.push(table._id);
    await project.save();
    await table.save();
    ctx.body = table._id;
  },
  async del(ctx) {
    var {projectName, id} = ctx.params;
    var project = await Project.find({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    var table = await Table.getById(id);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', 'table is not found');
    project.tables.splice(project.tables.indexOf(id), 1);
    await project.save();
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
    ctx.body = await getList(Table, ctx.params).populate('tables');
  },
  async count(ctx) {
    var count = await Table.count(ctx.params);
    ctx.body = {count};
  },
  async get(ctx) {
    var {id} = ctx.params;
    ctx.body = await Table.getById(id);
  },
  async getSchema(ctx, next) {
    var {name} = ctx.params;
    ctx.req.model = models[name];
    return next();
  }
};
