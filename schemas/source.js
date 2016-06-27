import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Tools from './../services/tools';

const SourceSchema = new Schema({
  collection: {
    type: Schema.Types.ObjectId,
    ref: 'Collection',
    required: true
  },
  data: Object
}, {
  timestamps: true
});

Tools.dealSchema(SourceSchema);

export default mongoose.model('Source', SourceSchema);
