import Project from '../schemas/project';

export default {
  async add(ctx) {
    var {project: projectName, domains} = ctx.req.body;
    try {
      var project = await Project.findOne({name: projectName});
      if (project) throw {
        code: 'PROJECT_EXIST_ERR',
        message: 'that project is exist.'
      }
      project = new Project({name: projectName, domains});
      await project.save();
      ctx.status = 200;
      ctx.body = project._id;
    } catch (err) {
      console.log(err);
      ctx.status = 400;
      ctx.body = err;
    }
  },
  async del(ctx) {},
  async edit(ctx) {},
  async list(ctx) {},
  async count(ctx) {},
  async get(ctx) {}
};
