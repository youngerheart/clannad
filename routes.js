import Router from 'koa-router';
import Auth from './controllers/auth';
import Project from './controllers/project';
import Table from './controllers/table';
import Source from './controllers/source';
import Field from './controllers/field';
import RestError from './services/resterror';

const router = new Router();

// 管理员接口

// 增加一个项目 所需字段: project, domain
router.post('/admin', Auth.isAdmin, Project.add);

router.use([
  '/admin/:projectName/:id',
  '/admin/:projectName/table',
  '/admin/:projectName/table/:id',
  '/admin/:projectName/field',
  '/admin/:projectName/field/:id'
], Auth.isAdmin);

// 删除项目以及其表与所有资源数据
router.del('/admin/:projectName/:id', Project.del);

// 修改项目 可修改: name, domain
router.put('/admin/:projectName/:id', Project.edit);

// 查询用户有权限的项目列表
router.get('/admin', Auth.fetchAuth);

// 查询某项目详情
router.get('/admin/:projectName', Project.detail);

// 查询某项目的表列表
router.get('/admin/:projectName/table', Table.list);

// 查询某项目的表总和
router.get('/admin/:projectName/table/count', Table.count);

// 为某个项目新增表
router.post('/admin/:projectName/table', Table.add);

// 删除某项目的某表
router.del('/admin/:projectName/table/:id', Table.del);

// 修改某项目的某表, 可修改 name, fields, visitorAuth, userAuth, adminAuth
router.put('/admin/:projectName/table/:id', Table.edit);

// 查询某表详情
router.get('/admin/:projectName/table/:id', Table.detail);

// 给某表加上一个字段，需要 field 本体
router.post('/admin/:projectName/field', Field.add);

// 修改某表的一个字段，可修改其任何内容
router.put('/admin/:projectName/field/:id', Field.edit);

// 删除某表的一个字段
router.put('/admin/:projectName/field/:id', Field.del);

// 用户接口
router.use(['/:projectName/:tableName', '/:projectName/:tableName/:id'], Auth.isUser, Table.getModel);

// 新增一个资源，需要 source本体。
router.post('/:projectName/:tableName', Source.add);

// 删除一个资源
router.del('/:projectName/:tableName/:id', Source.del);

// 修改一个资源
router.put('/:projectName/:tableName/:id', Source.edit);

// 获得资源列表
router.get('/:projectName/:tableName', Source.list);

// 获得资源总和
router.get('/:projectName/:tableName/count', Source.count);

// 获得单条资源
router.get('/:projectName/:tableName/:id', Source.detail);

// 如果都没有匹配到，抛出
router.all('*', (ctx) => {
  throw new RestError(405);
});

export default router;
