import Project from '../schemas/project';

const dealCheck = (ctx, needAuth, isDIY) => {
  var ownAuth = Auth.check(needAuth);
  if (!Array.isArray(ownAuth)) {
    ctx.status = 400;
    ctx.body = {
      code: 'AUTH_PARAMS_ERR',
      message: 'function error, authCheck function should return authArray.'
    };
    return false;
  }
  var errAuth = needAuth.filter((item) => {
    return ownAuth.indexOf(item) === -1;
  });
  if (errAuth.length) {
    if (!isDIY) {
      ctx.status = 403;
      ctx.body = {
        code: 'AUTH_VALIDATE_ERR',
        message: 'permission not enough, ${errAuth} is required.'
      };
    }
    return false;
  }
  return true;
};

const checkProject = (ctx, next, type) => {
  var project = ctx.params.project || ctx.req.body.project;
  if (!project) {
    ctx.status = 400;
    ctx.body = {
      code: 'AUTH_PARAMS_ERR',
      message: 'missing param \'project\'.'
    };
  } else if (dealCheck(ctx, [`${project}.${type}`])) return next();
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
    try {
       // 获取所有项目，筛选出其中有权限的
      const projects = await Project.find({}, '_id, name');
      if (!projects.length) {
        throw {
          code: 'PROJECT_NOTFOUND_ERR',
          message: 'initialed projects are not found'
        };
      }
      var resArr = projects.filter((project) => {
        var p1 = dealCheck(ctx, [`${project.name}.admin`], true);
        var p2 = dealCheck(ctx, [`${project.name}.user`], true);
        return p1 || p2;
      });
      if (!resArr.length) {
        throw {
          code: 'PROJECT_NOTFOUND_ERR',
          message: 'initialed projects are not found'
        };
      }
      ctx.status = 200;
      ctx.body = resArr;
    } catch (err) {
      ctx.status = 404;
      ctx.body = err;
    }
  }
};

export default Auth;
