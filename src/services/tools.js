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
    schema.statics.pullField = async function(select, name, value) {
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
        try {
          var result = await this.update(select, {
            $pull: {[name]: {$in: pullArr}}
          }, {
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
      if (params[item]) query[item] = params[item];
    });
    return query;
  },
  async getList({model, params, populate, query = {}, select = '', fields = []}) {
    params = fields.length ? Tool.getQuery(params, fields) : params;
    return model.find(params, select)
      .populate(populate || '')
      .limit(query.limit || 30)
      .skip(query.offset || 0)
      .sort(`${query.desc ? '' : '-'}updatedAt`);
  },
  parseArr(str) {
    return str.split('\'').filter(item => item.length > 3);
  }
};

export default Tool;
