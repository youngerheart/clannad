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

// 查询用户有权限的项目列表
router.get('/admin/project', Auth.fetchAuth);

router.use(['/admin/project/:id', '/admin/table', '/admin/table/:id', '/admin/field/:id'], Auth.isAdmin);

// 删除项目以及其表与所有资源数据
router.del('/admin/project/:id', Project.del);

// 修改项目 可修改: name, domain
router.put('/admin/project/:id', Project.edit);

// 为某个项目新增表
router.post('/admin/project/:id', Table.add);

// 删除某项目的某表
router.del('/admin/table/:id', Table.del);

// 修改某项目的某表, 可修改 name, fields, visitorAuth, userAuth, adminAuth
router.put('/admin/table/:id', Table.edit);

// 查询某项目的表列表
router.get('/admin/table', Table.list);

// 查询某项目的表总和
router.get('/admin/table/count', Table.count);

// 查询某项目的表详情
router.get('/admin/table/:id', Table.get);

// 给某表加上一个字段，需要 field 本体
router.post('/admin/field/:id', Field.add);

// 修改某表的一个字段，可修改其任何内容
router.put('/admin/field/:id', Field.edit);

// 删除某表的一个字段
router.put('/admin/field/:id', Field.edit);

// 用户接口
router.use(['/:name', '/:name/:id'], Auth.isUser, Table.getSchema);

// 新增一个资源，需要 source本体。
router.post('/:name', Source.add);

// 删除一个资源
router.del('/:name/:id', Source.del);

// 删除一个资源
router.put('/:name/:id', Source.edit);

// 获得资源列表
router.get('/:name', Source.list);

// 获得资源总和
router.get('/:name/count', Source.count);

// 获得单条资源
router.get('/:name/:id', Source.get);

// 如果都没有匹配到，抛出
router.all('*', (ctx) => {
  throw new RestError(405);
});

export default router;
