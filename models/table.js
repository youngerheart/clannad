import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Tools from './../services/tools';

const config = {
  type: [Boolean],
  default: [false, false, false, false, false],
  validate: [function(val) {
    return val.length === 4;
  }, '{PATH} length is not equal 4'],
  required: true
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
