import mongoose from 'mongoose';
import RestError from '../services/resterror';
import Project from '../models/project';
import {getQuery, dealSchema} from './tools';
const {Schema, Types} = mongoose;

// 目前暂时处理为：每次均重新读取，redis成本太大，且不符合需求，放弃。

// 储存当前所有的Model
var caches = {};
// 储存所有Model需要的字段信息
var globalFields = {};
// 储存表的权限信息
var auths = {};
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
    await Model.initCaches(projectName);
    return caches;
  },
  async removeCaches(field, projectName, tableName) {
    await Model.initCaches(projectName);
    // 更新该数据表中所有数据，删除该字段
    await caches[`${projectName}.${tableName}`].update({[field.name]: {$ne: null}}, {[field.name]: null});
  },
  async initProject(projectName) {
    var project = await Project.findOne({name: projectName}).populate('tables');
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERROR', `project ${projectName} is not found`);
    globalTokens[projectName] = project.tokens;
    cors[projectName] = project.domains;
    project.tables.forEach((table) => {
      let {visitorAuth, userAuth, adminAuth} = table;
      auths[`${projectName}.${table.name}`] = {visitorAuth, userAuth, adminAuth};
    });
  },
  async getAuths(projectName) {
    await Model.initProject(projectName);
    return JSON.parse(JSON.stringify(auths));
  },
  getShows(name) {
    return shows[name];
  },
  async getCORS(projectName) {
    await Model.initProject(projectName);
    return cors[projectName];
  },
  async hasToken(token, projectName) {
    if (!token) return;
    await Model.initProject(projectName);
    return globalTokens[projectName].indexOf(token) !== -1;
  }
};

export default Model;
