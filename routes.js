import Router from 'koa-router';
import Auth from './controllers/auth';
import Project from './controllers/project';
import Collection from './controllers/collection';
import Source from './controllers/source';
import RestError from './services/resterror';

const router = new Router();

// 管理员接口

// 增加一个项目 所需字段: project, domain
router.post('/admin', Auth.isAdmin, Project.add);

// 删除项目以及其集合与所有资源数据，需要 project.name
router.del('/admin/:project', Auth.isAdmin, Project.del);

// 修改项目 可修改: name, domain，需要 project.name
router.put('/admin/:project', Auth.isAdmin, Project.edit);

// 查询用户有权限的项目列表
router.get('/admin', Auth.fetchAuth);

// 为某个项目新增集合，需要 project.name
router.post('/admin/:project', Auth.isAdmin, Collection.add);

// 删除某项目的某集合，需要 project.name, collection.name
router.del('/admin/:project/:collection', Auth.isAdmin, Collection.del);

// 修改某项目的某集合，需要 project.name, collection.name, 可修改 name
router.put('/admin/:project/:collection', Auth.isAdmin, Collection.edit);

// 查询某项目的集合列表
router.get('/admin/:project', Auth.isAdmin, Collection.list);

// 查询某项目的集合总和
router.get('/admin/:project/count', Auth.isAdmin, Collection.count);

// 用户接口

// 新增一个资源，需要 project.name, collection.name，source本体。
router.post('/:project/:collection', Auth.isUser, Source.add);

// 删除一个资源，需要 project.name, collection.name, source.id
router.del('/:project/:collection/:id', Auth.isUser, Source.del);

// 删除一个资源，需要 project.name, collection.name, source.id, 可修改 source 中的各个字段
router.put('/:project/:collection/:id', Auth.isUser, Source.edit);

// 获得资源列表，需要 project.name, collection.name
router.get('/:project/:collection', Auth.isUser, Source.list);

// 获得资源总和，需要 project.name, collection.name
router.get('/:project/:collection/count', Auth.isUser, Source.count);

// 获得单条资源，需要 project.name, collection.name
router.get('/:project/:collection/:id', Auth.isUser, Source.get);

// 如果都没有匹配到，抛出
router.all('*', (ctx) => {
  throw new RestError(405);
});

export default router;
