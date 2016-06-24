# restdaze(unfinished)
manage RESTful APIs for micro projects.

もう全部RESTfulだ☆ぜ!

## 大致构想

由于需要做一个开源的工具，权限控制部分并不放在本项目中，而是对外暴露出接口。

当用户请求某路由时，将该路由所需要的权限交由外界处理，进行用户是否所需权限的判断。

如: 拥有某项目的管理员权限时可以使用所有该项目的管理员接口，并设置该项目管理员/普通用户对于该项目普通用户接口的使用权限。

权限认证后即可正确响应这些路由的操作。

基本功能完成后还需要做一些前端管理页面(在其他仓库)，之后再加入对于资源的schema功能。

## usage

install `mongodb` first.

```
$ npm install restdaze --save
```

```
import restdaze from 'restdaze';

restdaze.configDB((mongoose) => {
  // connection with mongodb
  mongoose.connect('mongodb://127.0.0.1:27017/restdaze');
});

restdaze.auth((authArr) => {
  console.log(`need auth: ${authArr}`);
  return authArr.slice();
});

restdaze.start(3000);
```

## develop

```
$ make dev
```

## API

关于目前所有的接口url，请参考 [routes.js](https://github.com/youngerheart/restdaze/blob/master/routes.js)。

关于所有资源字段详细信息，请参考 [DB docs](https://github.com/youngerheart/restdaze/tree/master/schemas/README.md)。

### 通用的可能报错的结果

`400 Bad Request` 参数错误，请求失败

`401 Unauthorized` 用户未登陆

`403 forbidden` 用户权限出错

`404 Not found` 未找到该资源

`405 Method Not Allowed` 没有该方法

`5xx ...` 服务器发生错误

### 通用查询参数

*通过id查询时不可用*

`limit` 显示的条目数，默认30

`offset` 起始条数，默认0

### 通用返回字段

`_id` 该条目id

`updatedAt` 该条目更新时间

`createdAt` 该条目创建时间

### 查询

查询列表: 直接输入资源路径, 返回资源数组 `[{_id: ...}, ...]`。

查询总数: 输入资源路径 + `/count`, 返回 `{count: ...}`。

查询单条: 输入资源路径 + `/:id`, 返回 `{_id: ...}`。
