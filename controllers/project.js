import Project from '../models/project';
import RestError from '../services/resterror';
import {getQuery} from '../services/tools';

export default {
  async add(ctx) {
    var {projectName, domains} = ctx.req.body;
    var project = new Project({name: projectName, domains});
    await project.save();
    ctx.body = {id: project._id};
  },
  async del(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.find({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    if (project.tables.length) throw new RestError('PROJECT_NOTEMPTY_ERR', 'tables array is not empty');
    await project.remove();
  },
  async edit(ctx) {
    var fields = getQuery(ctx.req.body, ['name', 'domains']);
    var {projectName} = ctx.params;
    await Project.update({name: projectName}, {name, fields});
  },
  async detail(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName}, '-__v -tables');
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    ctx.body = project;
  }
};
