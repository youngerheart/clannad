import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Tools from './../services/tools';

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
  visitorAuth: config,
  userAuth: config,
  adminAuth: config
}, {
  timestamps: true
});

Tools.dealSchema(TableSchema);

export default mongoose.model('Table', TableSchema);
