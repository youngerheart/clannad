import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import {dealSchema} from './../services/tools';

const FieldSchema = new Schema({
  table: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Table'
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
  required: Boolean,
  unique: Boolean,
  default: Schema.Types.Mixed,
  validExp: String,
  ref: String
}, {
  timestamps: true
});

dealSchema(FieldSchema);

export default mongoose.model('Field', FieldSchema);
