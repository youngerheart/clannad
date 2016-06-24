import {Schema} from 'mongoose';
import Tools from './../services/tools';

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  domains: {
    type: [String],
    validate: [function(val) {
      return val.length > 0;
    }, '{PATH} is emptyArray'],
    required: true
  }
});

Tools.dealSchema(ProjectSchema);

export default mongoose.model('Project', ProjectSchema);
