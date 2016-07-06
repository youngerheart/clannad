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
      return val.length > 0;
    }, '{PATH} is emptyArray'],
    required: true
  },
  tables: [{
    type: Schema.Types.ObjectId,
    ref: 'admin.table'
  }]
}, {
  timestamps: true
});

dealSchema(ProjectSchema);

export default mongoose.model('admin.project', ProjectSchema);
