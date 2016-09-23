import {readFileSync} from 'fs';
import DBIO from 'mongodb-io';
import RestError from '../services/resterror';
import Project from '../models/project';
import Table from '../models/table';

const File = {
  config: null,
  async export(ctx) {
    var config = File.config || {};
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    var tables = await Table.find({project: project._id});
    var tableIds = tables.map(table => table._id);
    // 导出的条件：
    // project导出该名称记录
    // table导出该projectId记录
    // field导出tableId记录
    // source导出${projectName.tableName}的记录
    var db = {
      name: config.db || 'clannad',
      collections: [{
        name: 'admin.projects',
        query: {name: projectName}
      }, {
        name: 'admin.tables',
        query: {id: {$in: tableIds}}
      }, {
        name: 'admin.fields',
        query: {table: {$in: tableIds}}
      }]
    };
    if (!config.noSource) {
      tables.forEach((table) => {
        db.collections.push(`${projectName}.${table.name}s`);
      });
    }
    var filePath = await DBIO.export([db], config);
    ctx.body = readFileSync(filePath);
    ctx.set('content-type', 'application/gzip');
  },
  async import(ctx) {
    var {path} = ctx.req.files[0];
    // 路径，从文件中获取
    var config = File.config || {};
    await DBIO.import(path, config);
  }
};

export default File;
