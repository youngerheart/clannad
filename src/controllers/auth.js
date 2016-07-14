import Project from '../models/project';
import RestError from '../services/resterror';
import {getAuths} from '../services/model';

const checkRoute = (param) => {
  if (param && (param === 'admin' || param === 'table')) throw new RestError(400, 'ROUTE_PARAMS_ERR', 'projectName unexpand \'admin\' or \'table\'');
};

const dealCheck = async (ctx, needAuth, isDIY) => {
  var ownAuth = await Auth.check(needAuth);
  if (!Array.isArray(ownAuth)) throw new RestError(400, 'AUTH_PARAMS_ERR', 'function error, authCheck function should return authArray');
  var errAuth = needAuth.filter((item) => {
    return ownAuth.indexOf(item) === -1;
  });
  if (errAuth.length) {
    if (!isDIY) throw new RestError(403, 'AUTH_VALIDATE_ERR', 'permission not enough, ${errAuth} is required');
    return false;
  }
  return true;
};

const checkProject = async (ctx, next, type) => {
  var {id} = ctx.params;
  if (type !== 'ROOT') checkRoute(id);
  var projectName = ctx.params.projectName || ctx.req.body.name;
  if (!projectName) throw new RestError(400, 'AUTH_PARAMS_ERR', `missing param \'${ctx.params.projectName ? 'projectName' : 'name'}\'`);
  else if (await dealCheck(ctx, [`${Auth.name}.${projectName.toUpperCase()}.${type}`])) return next();
};

const Auth = {
  name: 'REST',
  async check() {return false;},
  async isAdmin(ctx, next) {
    // 检查是否有某项目的管理员权限
    return await checkProject(ctx, next, 'ROOT');
  },
  async isUser(ctx, next) {
    // 检查是否有某项目的用户权限
    return await checkProject(ctx, next, 'ADMIN') || await checkProject(ctx, next, 'USER');
  },
  async fetchAuth(ctx, next) {
    // 获取所有项目，筛选出其中有权限的
    var projects = await Project.find({}, '_id name domains').sort('-updateAt');
    var resArr = [];
    for (let index = 0; index < projects.length; index++) {
      var adminCode = `${Auth.name}.${project.name.toUpperCase()}.ADMIN`;
      var userCode = `${Auth.name}.${project.name.toUpperCase()}.USER`;
      if (await dealCheck(ctx, [adminCode], true) ||
        await dealCheck(ctx, [userCode], true)) resArr.push(projects[index]);
    }
    ctx.body = resArr;
  },
  async hasTableAuth(ctx, next) {
    // 获取当前用户对该表的使用权限
    var authErr = new RestError(403, 'AUTH_ERR', 'permission denied');
    var method = ctx.method.toLowerCase();
    var {projectName, tableName} = ctx.params;
    checkRoute(projectName);
    var auth = (await getAuths(projectName))[`${projectName}.${tableName}`];
    if (!auth) throw new RestError(404, 'AUTH_NOTFOUND_ERR', 'table auths are not found');
    if ((await dealCheck(ctx, [`${Auth.name}.${projectName.toUpperCase()}.ROOT`], true) ||
      await dealCheck(ctx, [`${Auth.name}.${projectName.toUpperCase()}.ADMIN`], true))) {
      ctx.req.auth = 'admin';
      if (auth.adminAuth[method]) return next();
    } else if (await dealCheck(ctx, [`${Auth.name}.${projectName.toUpperCase()}.USER`], true)) {
      ctx.req.auth = 'user';
      if (auth.userAuth[ctx.method.toLowerCase()]) return next();
    } else {
      ctx.req.auth = 'visitor';
      if (auth.visitorAuth[ctx.method.toLowerCase()]) return next();
    }
    throw authErr;
  }
};

export default Auth;
