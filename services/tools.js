const Tool = {
  dealSchema(schema) {
    schema.statics.findById = function(id, select) {
      return this.findOne({_id: id}, select);
    };
    schema.statics.updateById = function(id, fields) {
      return this.update({_id: id}, fields);
    };
    schema.statics.removeById = function(id) {
      return this.remove({_id: id});
    };
  },
  getQuery(params, fields) {
    var query = {};
    fields.forEach((item) => {
      if (params[item]) query[item] = params[item];
    });
    return query;
  },
  async getList({model, params, populate, select = '', fields = []}) {
    var {limit, offset, ...others} = params;
    var query = fields.length ? Tool.getQuery(others, fields) : others;
    return model.find(query, select)
      .populate(populate)
      .limit(limit || 30)
      .skip(offset || 0);
  },
  parseArr(str) {
    return str.split('\'').filter(item => item.length > 3);
  }
};

export default Tool;
