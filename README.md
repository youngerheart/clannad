# restdaze
manage RESTful APIs for micro projects.

もう全部RESTfulだ☆ぜ!

## 大致构想

基本请求路径为:

```
(GET) domain/userinfo // 请求用户信息
// 管理员接口
(GET/PUT) domain/admin/:project // 请求业务信息/修改业务信息
(GET) domain/admin/:project/list // 请求集合列表
(GET/PUT/DELETE) domain/admin/:project/:collection // 请求单个集合/修改集合/删除集合及其中数据
// 普通用户接口
(GET/POST) domain/:project/:collection // 请求资源列表/新建资源
(GET/PUT/DELETE) domain/:project/:collection/:id // 请求单个资源/修改资源/删除资源
```

由于需要做一个开源的工具，权限控制部分并不放在本项目中，而是对外暴露出接口。

当用户请求某路由时，将该路由所需要的权限交由外界处理，进行用户是否所需权限的判断。

如: 拥有某业务的管理员权限时可以使用所有该业务的管理员接口，并设置该业务管理员/普通用户对于该业务普通用户接口的使用权限。

权限认证后即可正确响应这些路由的操作。

## TODO

写出更多文档，确立基本需求。
