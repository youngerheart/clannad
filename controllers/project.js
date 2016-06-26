import Project from '../schemas/project';
import RestError from '../services/resterror';

export default {
  async add(ctx) {
    var {project: projectName, domains} = ctx.req.body;
    var project = await Project.findOne({name: projectName});
    if (project) throw new RestError(400, 'PROJECT_EXIST_ERR', `project ${projectName} is exist`);
    project = new Project({name: projectName, domains});
    await project.save();
    ctx.status = 200;
    ctx.body = project._id;
  },
  async del(ctx) {
    var {project: projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) {
      throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    }
  },
  async edit(ctx) {},
  async list(ctx) {},
  async count(ctx) {},
  async get(ctx) {}
};
