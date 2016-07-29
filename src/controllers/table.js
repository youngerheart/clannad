import mongoose from 'mongoose';
import Project from '../models/project';
import Table from '../models/table';
import Field from '../models/field';
import RestError from '../services/resterror';
import {getQuery, getList} from '../services/tools';
import {getCaches, removeAuth, setAuth} from '../services/model';

const select = '-__v -project';

export default {
  async add(ctx) {
    var {name} = ctx.req.body;
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    // 一个项目中的表不可重复
    var table = await Table.findOne({project: project._id, name});
    if (table) throw new RestError(400, 'TABLE_EXIST_ERR', `table ${name} is existed in project ${projectName}`);
    table = new Table({name, project: project._id});
    if (!project.tables) project.tables = [];
    project.tables.push(table._id);
    await table.save();
    await project.save();
    await setAuth(table, projectName);
    ctx.body = {id: table._id};
  },
  async del(ctx) {
    var {id, projectName} = ctx.params;
    var table = await Table.findById(id);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', 'table is not found');
    await mongoose.connection.db
        .dropCollection(`${projectName}.${table.name}`)
        .catch((err) => {if (err.message !== 'ns not found') throw err;});
    await table.remove();
    await Project.editField({name: projectName}, 'tables', mongoose.Types.ObjectId(id));
    await Field.remove({table: table._id});
    await removeAuth(table, projectName);
  },
  async edit(ctx) {
    var {id, projectName} = ctx.params;
    var query = getQuery(ctx.req.body, ['adminAuth', 'userAuth', 'visitorAuth', 'name']);
    var table = await Table.findById(id);
    for (let key in query) table[key] = query[key];
    await table.save();
    await setAuth(table, projectName);
  },
  async list(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    var query = {project: project._id, ...ctx.query};
    ctx.body = await getList({
      model: Table,
      select,
      query
    });
  },
  async count(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    var query = {project: project._id, ...ctx.query};
    var count = await Table.count(query);
    ctx.body = {count};
  },
  async detail(ctx) {
    var {id} = ctx.params;
    var table = await Table.findById(id, select);
    if (!table) throw new RestError(404, 'TABLE_NOTFOUND_ERR', 'table is not found');
    ctx.body = table;
  },
  async getModel(ctx, next) {
    var {projectName, tableName} = ctx.params;
    var cache = (await getCaches(projectName))[`${projectName}.${tableName}`];
    if (!cache) throw new RestError(404, 'MODEL_NOTFOUND_ERR', `model ${projectName}.${tableName} is not found`);
    ctx.req.model = cache;
    return next();
  }
};
