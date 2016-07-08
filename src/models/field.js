import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import {dealSchema} from './../services/tools';

const showConfig = {
  type: Boolean,
  default: true
};

const FieldSchema = new Schema({
  table: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'admin.table'
  },
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['String', 'Number', 'Date', 'Buffer', 'Boolean', 'Mixed', 'ObjectId', 'Array'],
    required: true
  },
  show: {
    admin: showConfig,
    user: showConfig,
    visitor: showConfig
  },
  required: Boolean,
  unique: Boolean,
  default: Schema.Types.Mixed,
  validExp: String,
  ref: String,
  index: Boolean
}, {
  timestamps: true
});

dealSchema(FieldSchema);

export default mongoose.model('admin.field', FieldSchema);
