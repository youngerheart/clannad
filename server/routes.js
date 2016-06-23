import Router from 'koa-router';
import Auth from './controllers/auth';
import Project from './controllers/project';
import Collection from './controllers/collection';
import Source from './controllers/source';

const router = new Router();
// 管理员接口
router.post('/admin', Auth.checkAuth, Project.add);
router.put('/admin/:project', Auth.isAdmin, Project.edit);
router.get('/admin', Auth.fetchAuth, Project.list);
router.get('/admin/count', Auth.fetchAuth, Project.count);

router.post('/admin/:project', Auth.isAdmin, Collection.add);
router.del('/admin/:project/:id', Auth.isAdmin, Collection.del);
router.put('/admin/:project/:id', Auth.isAdmin, Collection.edit);
router.get('/admin/:project', Auth.isAdmin, Collection.list);
router.get('/admin/:project/count', Auth.isAdmin, Collection.count);
router.get('/admin/:project/:id', Auth.isAdmin, Collection.get);
// 用户接口
router.post('/admin/:project/:collection', Auth.isAuth, Source.add);
router.del('/admin/:project/:collection/:id', Auth.isAuth, Source.del);
router.put('/admin/:project/:collection/:id', Auth.isAuth, Source.edit);
router.get('/admin/:project/:collection', Auth.isAuth, Source.list);
router.get('/admin/:project/:collection/count', Auth.isAuth, Source.count);
router.get('/admin/:project/:collection/:id', Auth.isAuth, Source.get);

export default router;
