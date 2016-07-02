import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Tools from './../services/tools';

const FieldSchema = new Schema({
  table: {
    type: Schema.Types.ObjectId,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  type: {
    type: Schema.Types.Mixed,
    require: true
  },
  require: Boolean,
  unique: Boolean,
  default: Schema.Types.Mixed,
  validExp: String
}, {
  timestamps: true
});

Tools.dealSchema(FieldSchema);

export default mongoose.model('Field', FieldSchema);
