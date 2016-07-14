import Project from '../models/project';
import RestError from '../services/resterror';
import {getQuery} from '../services/tools';
import {initAuths, removeCORS, setTokens, removeTokens} from '../services/model';

export default {
  async add(ctx) {
    var {name, domains, tokens} = ctx.req.body;
    var project = new Project({name, domains, tokens});
    await project.save();
    ctx.body = {id: project._id};
  },
  async del(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName});
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    if (project.tables && project.tables.length) throw new RestError(400, 'PROJECT_NOTEMPTY_ERR', 'tables array is not empty');
    await project.remove();
    removeCORS(projectName);
  },
  async edit(ctx) {
    var fields = getQuery(ctx.req.body, ['domains', 'tokens']);
    var {projectName} = ctx.params;
    await Project.update({name: projectName}, fields, {runValidators: true});
    if (fields.tokens) setTokens(fields.tokens, projectName);
    if (fields.domains) await initAuths(projectName);
  },
  async detail(ctx) {
    var {projectName} = ctx.params;
    var project = await Project.findOne({name: projectName}, '-__v -tables');
    if (!project) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', `project ${projectName} is not found`);
    ctx.body = project;
  }
};
