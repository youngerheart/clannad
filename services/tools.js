const Tool = {
  dealSchema(schema) {},
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
  }
};

export default Tool;
