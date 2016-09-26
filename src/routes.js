import Router from 'koa-router';
import mongoose from 'mongoose';
import Auth from './controllers/auth';
import Project from './controllers/project';
import Token from './controllers/token';
import Table from './controllers/table';
import Source from './controllers/source';
import Field from './controllers/field';
import File from './controllers/file';

const router = new Router();

// 管理员接口

// 最高权限者删除所有数据，包括admin.xx
router.del('/admin', Auth.isMaster, async (ctx) => {
  await mongoose.connection.db.dropDatabase();
});

// 增加一个项目 所需字段: project, domain
router.post('/admin', Auth.isRoot, Project.add);

router.use([
  '/admin/:projectName'
], Auth.isRoot);

// 删除项目以及其表与所有资源数据
router.del('/admin/:projectName', Project.del);

// 修改项目 可修改: name, domain
router.patch('/admin/:projectName', Project.edit);

// 生成一个新的token
router.post('/admin/:projectName/token', Token.add);

// 删除一个 token
router.del('/admin/:projectName/token/:name', Token.del);

// 查看 token 数组
router.get('/admin/:projectName/token', Token.list);

// 导出数据
router.get('/admin/:projectName/_export/:fileName', File.export);

// 导入数据
router.post('/admin/:projectName/_import', File.import);

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
router.patch('/admin/:projectName/table/:id', Table.edit);

// 查询某表详情
router.get('/admin/:projectName/table/:id', Table.detail);

// 给某表加上一个字段，需要 field 本体
router.post('/admin/:projectName/table/:id/field', Field.add);

// 获取某表的字段列表
router.get('/admin/:projectName/table/:id/field', Field.list);

// 获取某表的字段总数
router.get('/admin/:projectName/table/:id/field/count', Field.count);

// 删除某表的一个字段
router.del('/admin/:projectName/field/:id', Field.del);

// 修改某表的一个字段，可修改其任何内容
router.patch('/admin/:projectName/field/:id', Field.edit);

// 获取某表的一个字段
router.get('/admin/:projectName/field/:id', Field.detail);

// 用户接口

// 查看该用户对该项目的权限
router.get('/:projectName/_auth', Auth.getProjectAuth)

router.use('/:projectName/:tableName', Auth.hasTableAuth, Table.getModel);

// 新增一个资源，需要 source本体。
router.post('/:projectName/:tableName', Source.add);

// 删除资源
router.del('/:projectName/:tableName', Source.del);

// 修改资源
router.patch('/:projectName/:tableName', Source.edit);

// 获得资源列表
router.get('/:projectName/:tableName', Source.list);

// 获得资源总和
router.get('/:projectName/:tableName/count', Source.count);

// 获取聚合数据
router.get('/:projectName/:tableName/aggregate', Source.aggregate);

// 获得单条资源
router.get('/:projectName/:tableName/detail', Source.detail);

export default router;
