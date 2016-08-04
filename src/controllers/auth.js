import Project from '../models/project';
import RestError from '../services/resterror';
import {getAuths, hasToken, getCORS} from '../services/model';

const checkRoute = (param) => {
  if (param && (param === 'admin' || param === 'table')) throw new RestError(400, 'ROUTE_PARAMS_ERR', 'projectName unexpand \'admin\' or \'table\'');
};

const dealCheck = async (ctx, needAuth, isDIY) => {
  var ownAuth = await Auth.check(ctx, needAuth);
  if (!Array.isArray(ownAuth)) throw new RestError(400, 'AUTH_PARAMS_ERR', 'function error, authCheck function should return authArray');
  var errAuth = needAuth.filter((item) => {
    return ownAuth.indexOf(item) === -1;
  });
  if (errAuth.length) {
    if (!isDIY) throw new RestError(403, 'AUTH_VALIDATE_ERR', `permission not enough, ${errAuth} is required`);
    return false;
  }
  return true;
};

const Auth = {
  name: 'REST',
  async check() {return [];},
  async isMaster(ctx, next) {
    if (await dealCheck(ctx, [`${Auth.name}.MASTER`])) return next();
  },
  async isRoot(ctx, next) {
    await Auth.setCORS(ctx, true);
    // 检查是否有某项目的管理员权限
    var projectName = ctx.params.projectName || ctx.req.body.name;
    if (!projectName) throw new RestError(400, 'AUTH_PARAMS_ERR', `missing param \'${ctx.params.projectName ? 'projectName' : 'name'}\'`);
    else if (await dealCheck(ctx, [`${Auth.name}.${projectName.toUpperCase()}.ROOT`])) return next();
  },
  async setCORS(ctx, isRoot) {
    // add cors
    if (!ctx.headers.origin) return;
    var cors = isRoot || !ctx.params ? null : await getCORS(ctx.params.projectName);
    var origin = '';
    if (cors && cors.indexOf(ctx.headers.origin) !== -1 || !cors) origin = ctx.headers.origin;
    ctx.set({
      'access-control-allow-credentials': true,
      'access-control-allow-headers': 'X-Requested-With, Content-Type, X-Token',
      'access-control-allow-methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'access-control-allow-origin': origin
    });
  },
  async fetchAuth(ctx, next) {
    await Auth.setCORS(ctx, true);
    // 获取所有项目，筛选出其中有权限的
    var projects = await Project.find({}, '-__v').sort('-createdAt');
    var pointers = {};
    var authArr = projects.map((project) => {
      var value = `${Auth.name}.${project.name.toUpperCase()}.ROOT`;
      pointers[project.name] = value;
      return value;
    });
    var ownAuth = await Auth.check(ctx, authArr);
    ctx.body = projects.filter(project => ownAuth.indexOf(pointers[project.name]) !== -1);
  },
  async hasTableAuth(ctx, next) {
    await Auth.setCORS(ctx);
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
    } else if (await dealCheck(ctx, [`${Auth.name}.${projectName.toUpperCase()}.USER`], true) ||
      await hasToken(ctx.headers['x-token'], projectName)) {
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
