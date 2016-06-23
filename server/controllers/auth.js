const dealCheck = (ctx, needAuth) => {
  var ownAuth = Auth.check(needAuth);
  return needAuth.filter((item) => {
    return ownAuth.indexOf(item) === -1;
  });
};

const Auth = {
  check() {return false},
  async isAdmin(ctx) {
    // 检查是否有某项目的管理员权限
  },
  async isUser(ctx) {
    // 检查是否有某项目的用户权限
  },
  async fetchAuth(ctx, next) {
    // 获取所有项目，筛选出其中有权限的
  }
};

export default Auth;
