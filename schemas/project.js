import mongoose from 'mongoose';
const Schema = mongoose.Schema;
import Tools from './../services/tools';

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
  }
}, {
  timestamps: true
});

Tools.dealSchema(ProjectSchema);

export default mongoose.model('Project', ProjectSchema);
