const dealCheck = (ctx, needAuth) => {
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
    ctx.status = 403;
    ctx.body = {
      code: 'AUTH_VALIDATE_ERR',
      message: 'permission not enough, ${errAuth} is required.'
    };
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
  } else if (dealCheck(ctx, [`${project}.${type}`])) next();
};

const Auth = {
  check() {return false;},
  isAdmin(ctx, next) {
    // 检查是否有某项目的管理员权限
    checkProject(ctx, next, 'admin');
  },
  isUser(ctx, next) {
    // 检查是否有某项目的用户权限
    checkProject(ctx, next, 'user');
  },
  fetchAuth(ctx, next) {
    // 获取所有项目，筛选出其中有权限的
  }
};

export default Auth;
