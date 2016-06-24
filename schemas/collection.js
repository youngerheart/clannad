import {Schema} from 'mongoose';
import Tools from './../services/tools';

const CollectionSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  adminAuth: {
    type: [Boolean],
    default: [false, false, false, false],
    validate: [function(val) {
      return val.length === 4;
    }, '{PATH} length is not equal 4'],
    required: true
  },
  userAuth: {
    type: [Boolean],
    default: [false, false, false, false],
    validate: [function(val) {
      return val.length === 4;
    }, '{PATH} length is not equal 4'],
    required: true
  }
});

Tools.dealSchema(CollectionSchema);

export default mongoose.model('Collection', CollectionSchema);
