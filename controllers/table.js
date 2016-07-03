import mongoose from 'mongoose';
import Project from '../models/project';
import Table from '../models/table';
import Field from '../models/field';
import RestError from '../services/resterror';
import {getQuery, getList, models} from '../services/tools';

export default {
  async add(ctx) {
    var {name} = ctx.req.body;
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    var table = new Table({name, project: project._id});
    if (!project.tables) project.tables = [];
    project.tables.push(table._id);
    await project.save();
    await table.save();
    ctx.body = {id: table._id};
  },
  async del(ctx) {
    var {id} = ctx.params;
    var table = await Table.getById(id);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', 'table is not found');
    var project = await Project.findById(table.project);
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${table.project} is not found`);
    project.tables.splice(project.tables.indexOf(id), 1);
    await mongoose.connection.db.dropCollection(`${project.name}.${table.name}`);
    await project.save();
    await Field.remove({table: {$in: table.field}});
    await table.remove();
  },
  async edit(ctx) {
    var {id} = ctx.params;
    var query = getQuery(ctx.req.body, ['adminAuth', 'userAuth', 'visitorAuth', 'name']);
    await Table.updateById(id, query);
  },
  async list(ctx) {
    ctx.body = await getList({
      model: Table,
      params: ctx.params
    });
  },
  async count(ctx) {
    var count = await Table.count(ctx.params);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {id} = ctx.params;
    var table = await Table.getById(id);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', 'table is not found');
    ctx.body = table;
  },
  async getModel(ctx, next) {
    var {projectName, tableName} = ctx.params;
    if (!models[`${projectName}.${tableName}`]) throw new RestError(404, 'MODEL_NOTFOUND_ERR', `model ${name} is not found`);
    ctx.req.model = models[name];
    return next();
  }
};
