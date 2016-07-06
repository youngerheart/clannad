import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Project from '../models/project';
import {getQuery, dealSchema} from './tools';

var caches = null;
var globalFields = null;
var auths = null;

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
  let others = getQuery(data, ['required', 'unique', 'default', 'ref']);
  return {...field, ...others};
};

const setModel = (schema, name) => {
  dealSchema(schema);
  caches[name] = mongoose.model(name, schema);
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
      table.fields.forEach((field) => {
        fields[field.name] = getField(field);
      });
      let name = `${project.name}.${table.name}`;
      globalFields[name] = fields;
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
    setModel(new Schema(fields, {timestamps: true}), name);
  },
  async removeCaches(fieldData, projectName, tableName) {
    if (!caches) await Model.initCaches(projectName);
    var name = `${projectName}.${tableName}`;
    var fields = globalFields[name];
    delete fields[fieldData.name];
    setModel(new Schema(fields, {timestamps: true}), name);
  },
  async initAuths(projectName) {
    if (!auths) auths = {};
    var project = await Project.findOne({name: projectName}).populate('tables');
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
  }
};

export default Model;
