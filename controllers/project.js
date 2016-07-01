import Project from '../schemas/project';
import RestError from '../services/resterror';
import {getQuery} from '../services/tools';

export default {
  async add(ctx) {
    var {project: projectName, domains} = ctx.req.body;
    project = new Project({name: projectName, domains});
    await project.save();
    ctx.body = project._id;
  },
  async del(ctx) {
    var {id} = ctx.params;
    var project = await Project.findById(id);
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    await project.remove();
  },
  async edit(ctx) {
    var fields = getQuery(ctx.req.body, ['name', 'domains']);
    var {id} = ctx.params;
    await Project.updateById(id, {name, fields});
  }
};
