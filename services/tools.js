const Tool = {
  dealSchema(schema) {
    schema.statics.findById = function(id) {
      return this.findOne({_id: id});
    };
    schema.statics.updateById = function(id, fields) {
      return this.update({_id: id}, fields);
    };
  },
  getQuery(params, fields) {
    var query = {};
    fields.forEach((item) => {
      if (params[item]) query[item] = params[item];
    });
    return query;
  },
  async getList(model, params, select = '', fields = []) {
    var {limit, offset, ...others} = params;
    var query = Tool.getQuery(others, fields);
    return model.find(query, select)
      .limit(limit || 30)
      .skip(offset || 0);
  },
  parseArr(str) {
    return str.split('\'').filter(item => item.length > 3);
  },
  models: []
};

export default Tool;
