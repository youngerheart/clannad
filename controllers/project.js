import Project from '../schemas/project';
import RestError from '../services/resterror';
import {getQuery, getList} from '../services/tools';

export default {
  async add(ctx) {
    var {project: projectName, domains} = ctx.req.body;
    domains = domains.split('\'').filter(item => item.length > 3);
    var project = await Project.findOne({name: projectName});
    if (project) throw new RestError(400, 'PROJECT_EXIST_ERR', `project ${projectName} is exist`);
    project = new Project({name: projectName});
    project.domains.push(...domains);
    await project.save();
    ctx.body = project._id;
  },
  async del(ctx) {
    var {project: projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    await project.remove();
  },
  async edit(ctx) {
    var {name, domains} = getQuery(ctx.req.body, ['name', 'domains']);
    domains = domains.split('\'').filter(item => item.length > 3);
    var {project: projectName} = ctx.params;
    var updated = await Project.update({name: projectName}, {name, domains});
  }
};
