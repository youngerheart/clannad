import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import {dealSchema} from './../services/tools';

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  domains: {
    type: [String],
    validate: [function(val) {
      var arr = val.slice().sort();
      for (let i = 1; i < arr.length; ++i) {
        if (arr[i] === arr[i - 1]) {
          return false;
        }
      }
      return val.length > 0;
    }, '{PATH} is duplicate or empty'],
    required: true
  },
  tables: [{
    type: Schema.Types.ObjectId,
    ref: 'admin.table'
  }],
  tokens: {
    type: [String],
    validate: [function(val) {
      var arr = val.slice().sort();
      for (let i = 1; i < arr.length; ++i) {
        if (arr[i] === arr[i - 1]) {
          return false;
        }
      }
      return true;
    }, '{PATH} is duplicate']
  }
}, {
  timestamps: true
});

dealSchema(ProjectSchema);

export default mongoose.model('admin.project', ProjectSchema);
