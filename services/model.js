import Project from '../models/project';

var Model = {
  caches: {},
  auths: null,
  async initAuths(projectName) {
    Model.auths = {};
    var project = await Project.findOne({name: projectName}).populate('tables');
    project.tables.forEach((table) => {
      let {visitorAuth, userAuth, adminAuth} = table;
      Model.auths[`${projectName}.${table.name}`] = {visitorAuth, userAuth, adminAuth};
    });
  },
  async getAuths(projectName) {
    if (!Model.auths) await Model.initAuths(projectName);
    return JSON.parse(JSON.stringify(Model.auths));
  },
  async setAuth(table, projectName) {
    var {visitorAuth, userAuth, adminAuth} = table;
    if (!Model.auths) await Model.initAuths(projectName);
    Model.auths[`${projectName}.${table.name}`] = {visitorAuth, userAuth, adminAuth};
  }
};

export default Model;
