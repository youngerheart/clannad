import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import {dealSchema} from './../services/tools';

const defaultBoolean = {
  type: Boolean,
  default: false
}

const config = {
  get: defaultBoolean,
  post: defaultBoolean,
  patch: defaultBoolean,
  delete: defaultBoolean
};

const TableSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  fields: [{
    type: Schema.Types.ObjectId,
    ref: 'Field'
  }],
  visitorAuth: config,
  userAuth: config,
  adminAuth: config
}, {
  timestamps: true
});

dealSchema(TableSchema);

export default mongoose.model('Table', TableSchema);
