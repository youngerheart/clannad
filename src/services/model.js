import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import RestError from '../services/resterror';
import Project from '../models/project';
import {getQuery, dealSchema} from './tools';

// 储存当前所有的Model
var caches = null;
// 储存所有Model需要的字段信息
var globalFields = null;
// 储存表的权限信息
var auths = null;
// 储存字段的查看权限
var shows = {};
// 储存所有cors的domain数组
var cors = {};

const getField = (data) => {
  data = JSON.parse(JSON.stringify(data));
  let field = {};
  // 处理类型
  switch (data.type) {
    case 'ObjectId':
    case 'Mixed':
      field.type = Schema.Types[data.type];
      break;
    default:
      field.type = global[data.type];
      break;
  }
  // 处理正则
  if (data.validExp) field.validate = new RegExp(data.validExp);
  let others = getQuery(data, ['required', 'unique', 'default', 'ref', 'index']);
  return {...field, ...others};
};

const setModel = (schema, name) => {
  dealSchema(schema);
  if (!caches[name]) caches[name] = mongoose.model(name, schema);
  else caches[name].schema = schema;
  return caches[name];
};

var Model = {
  async initCaches(projectName) {
    if (!caches) caches = {};
    if (!globalFields) globalFields = {};
    var project = await Project
    .findOne({name: projectName})
    .populate({
      path: 'tables',
      populate: {path: 'fields'}
    });
    project.tables.forEach((table) => {
      let fields = {};
      // 重做显示权限
      let show = {};
      table.fields.forEach((field) => {
        fields[field.name] = getField(field);
        show[field.name] = JSON.parse(JSON.stringify(field.show));
      });
      let name = `${project.name}.${table.name}`;
      globalFields[name] = fields;
      shows[name] = show;
      setModel(new Schema(fields, {timestamps: true}), name);
    });
  },
  async getCaches(projectName) {
    if (!caches) await Model.initCaches(projectName);
    return caches;
  },
  async setCache(fieldData, projectName, tableName) {
    if (!caches) await Model.initCaches(projectName);
    var name = `${projectName}.${tableName}`;
    var fields = globalFields[name];
    fields[fieldData.name] = getField(fieldData);
    globalFields[name] = fields;
    // 更新显示权限
    if (!shows[name]) shows[name] = {};
    shows[name][fieldData.name] = JSON.parse(JSON.stringify(fieldData.show));
    var model = setModel(new Schema(fields, {timestamps: true}), name);
    // 更新该数据表的所有数据，为该字段赋初值
    await model.update({[fieldData.name]: null}, {[fieldData.name]: fields[fieldData.name].default || ''});
  },
  async removeCaches(fieldData, projectName, tableName) {
    if (!caches) await Model.initCaches(projectName);
    var name = `${projectName}.${tableName}`;
    var fields = globalFields[name];
    delete fields[fieldData.name];
    // 删除显示权限
    if (shows[name] && shows[name][fieldData.name]) delete shows[name][fieldData.name];
    var model = setModel(new Schema(fields, {timestamps: true}), name);
    // 更新该数据表中所有数据，删除该字段
    await model.update({[fieldData.name]: {$ne: null}}, {[fieldData.name]: null});
  },
  async initAuths(projectName) {
    if (!auths) auths = {};
    var project = await Project.findOne({name: projectName}).populate('tables');
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERROR', `project ${projectName} is not found`);
    cors[projectName] = project.domains;
    project.tables.forEach((table) => {
      let {visitorAuth, userAuth, adminAuth} = table;
      auths[`${projectName}.${table.name}`] = {visitorAuth, userAuth, adminAuth};
    });
  },
  async getAuths(projectName) {
    if (!auths) await Model.initAuths(projectName);
    return JSON.parse(JSON.stringify(auths));
  },
  async setAuth(table, projectName) {
    var {visitorAuth, userAuth, adminAuth} = table;
    if (!auths) await Model.initAuths(projectName);
    auths[`${projectName}.${table.name}`] = {visitorAuth, userAuth, adminAuth};
  },
  async removeAuth(table, projectName) {
    if (!auths) await Model.initAuths(projectName);
    delete auths[`${projectName}.${table.name}`];
  },
  getShows(name) {
    return shows[name];
  },
  getCORS(name) {
    return cors[name];
  },
  removeCORS(name) {
    delete cors[name];
  }
};

export default Model;
