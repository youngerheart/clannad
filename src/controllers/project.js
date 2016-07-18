import Project from '../models/project';
import RestError from '../services/resterror';
import {getQuery} from '../services/tools';
import {initAuths, removeCORS, removeTokens} from '../services/model';

export default {
  async add(ctx) {
    var fields = getQuery(ctx.req.body, ['name', 'domains']);
    var project = new Project(fields);
    await project.save();
    ctx.body = {id: project._id};
  },
  async del(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    if (project.tables && project.tables.length) throw new RestError(400, 'PROJECT_NOTEMPTY_ERR', 'tables array is not empty');
    await project.remove();
    await removeTokens(projectName);
    await removeCORS(projectName);
  },
  async edit(ctx) {
    var fields = getQuery(ctx.req.body, ['domains']);
    var {projectName} = ctx.params;
    await Project.update({name: projectName}, fields, {runValidators: true});
    if (fields.domains) await initAuths(projectName);
  },
  async detail(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName}, '-__v -tables -tokens');
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    ctx.body = project;
  }
};
