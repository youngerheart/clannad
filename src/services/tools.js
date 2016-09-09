import {Types} from 'mongoose';
import RestError from './resterror';
import uniqueValidator from 'mongoose-unique-validator';

const parseJson = str => str ? JSON.parse(str) : str;

const parseObjectId = (obj) => {
  switch (typeof obj) {
    case 'string':
      try {return Types.ObjectId(obj);} catch (err) {};
      break;
    case 'object':
      if (Array.isArray(obj)) {
        for (let index = 0; index < obj.length; index++) {
          obj[index] = parseObjectId(obj[index]);
        }
        return obj;
      } else {
        for (let key in obj) {
          obj[key] = parseObjectId(obj[key]);
        }
        return obj;
      }
    default:
      return obj;
  }
};

const Tool = {
  dealSchema(schema) {
    schema.plugin(uniqueValidator);
    schema.statics.findById = function(id, select) {
      return this.findOne({_id: id}, select);
    };
    schema.statics.updateById = function(id, fields) {
      return this.update({_id: id}, fields);
    };
    schema.statics.removeById = function(id) {
      return this.remove({_id: id});
    };
    schema.statics.editField = async function (select, name, value, ispush = false) {
      var resolve, reject, prom;
      if (!this._fields) this._fields = {deal: [], pullArr: []};
      prom = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
      this._fields.deal.push({resolve, reject});
      this._fields.pullArr.push(value);
      var check = async () => {
        var deal = this._fields.deal.splice(0, this._fields.deal.length);
        var pullArr = this._fields.pullArr.splice(0, this._fields.pullArr.length);
        var updateObj = ispush ? {$pushAll: {[name]: pullArr}} : {$pull: {[name]: {$in: pullArr}}};
        try {
          await this.update(select, updateObj, {
            multi: true
          });
          deal.forEach((deal) => deal.resolve());
        } catch (err) {
          deal.forEach((deal) => deal.reject(err));
        }
        if (this._fields.deal.length) await check();
        else this._fields.locked = false;
      };
      if (!this._fields.locked) {
        this._fields.locked = true;
        await check();
      }
      return prom;
    };
  },
  getQuery(params, fields) {
    var query = {};
    fields.forEach((item) => {
      if (params[item] !== undefined) query[item] = params[item];
    });
    return query;
  },
  getList({model, query, select = ''}) {
    var {limit, offset, asc, populate: populateStr, sort, params: paramsStr, ...params} = query;
    var populate = parseJson(populateStr);
    // 处理从系统内部与外界传来的参数
    params = {...parseJson(paramsStr) || {}, ...params};
    return model.find(params, select)
      .populate(populate || '')
      .limit(parseInt(limit) || 30)
      .skip(parseInt(offset) || 0)
      .sort(`${asc ? '' : '-'}${sort || 'createdAt'}`);
  },
  getAggregate({model, query, group: groupStr, sort: sortStr, select = ''}) {
    var {params: paramsStr, ...params} = query;
    var $match = {...parseJson(paramsStr) || {}, ...params};
    parseObjectId($match);
    var $group = JSON.parse(groupStr);
    select.trim().split(' ').forEach((item) => {
      if ($group._id && $group._id.indexOf(item.replace('-', '')) !== -1) {
        throw new RestError(403, 'AUTH_ERR', 'no permission for aggregate group');
      }
    });
    var exp = [{$match}, {$sort: sortStr ? JSON.parse(sortStr) : {_id: 1}}, {$group}];
    return model.aggregate(exp);
  },
  parseArr(str) {
    return str.split('\'').filter(item => item.length > 3);
  },
  parseNull(params) {
    for (let key in params) {
      var param = params[key];
      if (param === '') params[key] = null;
      try {
        params[key] = JSON.parse(param);
      } catch (err) {
        params[key] = param;
      }
    }
    return params;
  }
};

export default Tool;
