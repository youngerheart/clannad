import mongoose from 'mongoose';
import RestError from '../services/resterror';
import Project from '../models/project';
import {getQuery, dealSchema} from './tools';
const {Schema, Types} = mongoose;

// 目前暂时处理为：每次均重新读取，之后写redius逻辑

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
// 储存所有项目的token数组
var globalTokens = {};

const getField = (data) => {
  data = JSON.parse(JSON.stringify(data));
  let field = {};
  // 处理类型, 默认值
  switch (data.type) {
    case 'ObjectId':
    case 'Mixed':
      field.type = Schema.Types[data.type];
      if (data.default) field.default = Types[data.type](data.default);
      break;
    case 'ObjectIdArray':
      field.type = Schema.Types.ObjectId;
      if (data.default) {
        if (typeof data.default === 'string') data.default = JSON.parse(data.default);
        field.default = data.default.map((item) => Types.ObjectId(item));
      }
      break;
    case 'Object':
    case 'Array':
      field.type = global[data.type];
      if (data.default) {
        if (typeof data.default === 'string') data.default = JSON.parse(data.default);
        field.default = data.default;
      }
      break;
    default:
      field.type = global[data.type];
      if (data.default) field.default = data.default;
      break;
  }
  // 处理正则
  if (data.validExp) field.validate = new RegExp(data.validExp);
  // 处理ref
  if (data.ref) field.ref = data.ref;
  let others = getQuery(data, ['required', 'unique', 'index']);
  if (data.type === 'ObjectIdArray') return [{...field, ...others}];
  return {...field, ...others};
};

const setModel = (schema, name) => {
  dealSchema(schema);
  if (caches[name]) delete mongoose.models[name];
  caches[name] = mongoose.model(name, schema);
  return caches[name];
};

const Model = {
  async initCaches(projectName) {
    var project = await Project
    .findOne({name: projectName})
    .populate({
      path: 'tables',
      populate: {path: 'fields'}
    });
    if (!caches) caches = {};
    if (!globalFields) globalFields = {};
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
    // if (!caches) await Model.initCaches(projectName);
    await Model.initCaches(projectName);
    return caches;
  },
  async setCache(fieldData, projectName, tableName) {
    // if (!caches) await Model.initCaches(projectName);
    await Model.initCaches(projectName);
    // else {
    //   var name = `${projectName}.${tableName}`;
    //   var fields = globalFields[name];
    //   fields[fieldData.name] = getField(fieldData);
    //   globalFields[name] = fields;
    //   // 更新显示权限
    //   if (!shows[name]) shows[name] = {};
    //   shows[name][fieldData.name] = JSON.parse(JSON.stringify(fieldData.show));
    //   var model = setModel(new Schema(fields, {timestamps: true}), name);
    //   // 更新该数据表的所有数据，为该字段赋初值
    //   await model.update({[fieldData.name]: null}, {[fieldData.name]: fields[fieldData.name].default || null});
    // }
  },
  async removeCaches(fieldData, projectName, tableName) {
    // if (!caches) await Model.initCaches(projectName);
    await Model.initCaches(projectName);
    var name = `${projectName}.${tableName}`;
    var fields = globalFields[name];
    delete fields[fieldData.name];
    // 删除显示权限
    // if (shows[name] && shows[name][fieldData.name]) delete shows[name][fieldData.name];
    var model = setModel(new Schema(fields, {timestamps: true}), name);
    // 更新该数据表中所有数据，删除该字段
    await model.update({[fieldData.name]: {$ne: null}}, {[fieldData.name]: null});
  },
  async initAuths(projectName) {
    var project = await Project.findOne({name: projectName}).populate('tables');
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERROR', `project ${projectName} is not found`);
    if (!auths) auths = {};
    cors[projectName] = project.domains;
    project.tables.forEach((table) => {
      let {visitorAuth, userAuth, adminAuth} = table;
      auths[`${projectName}.${table.name}`] = {visitorAuth, userAuth, adminAuth};
    });
  },
  async getAuths(projectName) {
    // if (!auths) await Model.initAuths(projectName);
    await Model.initAuths(projectName);
    return JSON.parse(JSON.stringify(auths));
  },
  async setAuth(table, projectName) {
    var {visitorAuth, userAuth, adminAuth} = table;
    // if (!auths) await Model.initAuths(projectName);
    await Model.initAuths(projectName);
    auths[`${projectName}.${table.name}`] = {visitorAuth, userAuth, adminAuth};
  },
  async removeAuth(table, projectName) {
    // if (!auths) await Model.initAuths(projectName);
    await Model.initAuths(projectName);
    delete auths[`${projectName}.${table.name}`];
  },
  getShows(name) {
    return shows[name];
  },
  getCORS(name) {
    return name ? cors[name] : [];
  },
  removeCORS(name) {
    delete cors[name];
  },
  async initTokens(projectName) {
    // if (!globalTokens[projectName]) globalTokens[projectName] = (await Project.findOne({name: projectName})).tokens;
    globalTokens[projectName] = (await Project.findOne({name: projectName})).tokens;
  },
  async setToken(token, projectName) {
    if (!token) return;
    await Model.initTokens(projectName);
    var index = globalTokens[projectName].indexOf(token);
    if (index === -1) globalTokens[projectName].push(token);
    else throw new RestError(404, 'TOKEN_EXIST_ERROR', `token ${token} is exist`);
  },
  async removeToken(token, projectName) {
    if (!token) return;
    await Model.initTokens(projectName);
    var index = globalTokens[projectName].indexOf(token);
    if (index !== -1) globalTokens[projectName].splice(index, 1);
    else throw new RestError(404, 'TOKEN_NOTFOUND_ERROR', `token ${token} is not found`);
  },
  async hasToken(token, projectName) {
    if (!token) return;
    await Model.initTokens(projectName);
    return globalTokens[projectName].indexOf(token) !== -1;
  },
  async removeTokens(projectName) {
    await Model.initTokens(projectName);
    delete globalTokens[projectName];
  }
};

export default Model;
