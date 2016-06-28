import Project from '../schemas/project';
import RestError from '../services/resterror';

const dealCheck = (ctx, needAuth, isDIY) => {
  var ownAuth = Auth.check(needAuth);
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

const checkProject = (ctx, next, type) => {
  var project = ctx.params.project || ctx.req.body.project;
  if (!project) throw new RestError(400, 'AUTH_PARAMS_ERR', 'missing param \'project\'');
  else if (dealCheck(ctx, [`${project}.${type}`])) return next();
};

const Auth = {
  check() {return false;},
  isAdmin(ctx, next) {
    // 检查是否有某项目的管理员权限
    return checkProject(ctx, next, 'admin');
  },
  isUser(ctx, next) {
    // 检查是否有某项目的用户权限
    return checkProject(ctx, next, 'user');
  },
  async fetchAuth(ctx, next) {
    // 获取所有项目，筛选出其中有权限的
    const projects = await Project.find({}, '_id, name');
    if (!projects.length) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', 'initialed projects are not found');
    var resArr = projects.filter((project) => {
      var p1 = dealCheck(ctx, [`${project.name}.admin`], true);
      var p2 = dealCheck(ctx, [`${project.name}.user`], true);
      return p1 || p2;
    });
    if (!resArr.length) throw new RestError(404, 'PROJECT_NOTFOUND_ERR', 'initialed projects are not found');
    ctx.status = 200;
    ctx.body = resArr;
  }
};

export default Auth;
