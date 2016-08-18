[![NPM version](https://img.shields.io/npm/v/clannad.svg)](https://www.npmjs.com/package/clannad) [![Downloads](https://img.shields.io/npm/dm/clannad.svg)](http://badge.fury.io/js/clannad)

#clannad

data storage service with RESTful APIs.

![clannad](http://ww1.sinaimg.cn/large/0060lm7Tgw1f5mjbjqhckj316e0fkafh.jpg)
みんな　みんな　あわせで　ひゃくにんかぞく

## Intention & achieved

You will get data you needed, without back-end develop, just APIs.

## How it works

![how it works](http://ww3.sinaimg.cn/large/0060lm7Tgw1f69kgcvdelj30ry0q4ags.jpg)

## Usage

install `mongodb` first.

```
$ npm install clannad --save
```

```
import clannad from 'clannad';

clannad.configDB((mongoose) => {
  // connection with mongodb
  mongoose.connect('mongodb://127.0.0.1:27017/clannad');
});

clannad.auth(async (ctx, authArr) => {
  // return authArr by your auth system, or return itself while don't need auth system
  // each authcode is like '${PREFIX}.${PROJECTNAME}.${ROLENAME}'
  // rolename enum as 'master', 'root', 'admin', 'user'
  return await check(ctx, authArr);
}, 'REST'); // prefix for each authcode, default 'REST'

// router interface
// These routers are occupied and shouldn't be rewritten.
// /admin, /admin/**, /*/**
clannad.router['get, post...']((ctx) => {
  // dealing mongoose model with ctx.req.model
});

clannad.app.use(...) // clannad's koa app
clannad.app.listen(3000, () => {
  process.stderr.write(`Server running at http://localhost:3000\n`);
});
```

### About Auth

**root**

could use APIs about own project (admin.projects)

* project's CORS configure with every role (field domains).

project's table (admin.tables)

* table's availability with each role (field adminAuth, userAuth and visitorAuth).

and table's field (admin.fields)

* field's visibility with each role (field show).

**admin** admin and root could use APIs about ${projectName}.${tableName} configured by root, depend on config 'adminAuth' in admin.table.

**user** could use APIs about ${projectName}.${tableName} configured by root, depend on config 'userAuth' in admin.table.

**visitor** could use APIs about ${projectName}.${tableName} configured by root, depend on config 'visitorAuth' in admin.table.

**token** while a request header own field 'X-Token', and it's value exist in that admin.project.tokens, that request will be regarded as a user's request.

## Develop & Test

```
$ make dev
$ cd test && make source
```

## API

about all API's route, view [routes.js](https://github.com/youngerheart/clannad/blob/master/src/routes.js)。

about all table field's detail, view [DB docs](https://github.com/youngerheart/clannad/blob/master/src/models/README.md)。

### General possible error results

`400 Bad Request`

`401 Unauthorized`

`403 forbidden`

`404 Not found`

`405 Method Not Allowed`

`5xx ...`

### General query params

`populate` a JSON about you want to populate, such as `{"path": "field1","select": "name",populete:{"path":...}}`

`select` a JSON about you want to select, such as `["field1","field2",...]`

*disabled while query by id*

`params` is data about criterial:
* a JSON, such as `{"field1":{"$gte":21},"field2":"duang",...}`
* or you can use queryString, such as `field1=xxx&field2=xxx&...`

`limit` default 30

`offset` default 0

`sort` use which field to sort, default `createAt`

`asc` default sort is `-${sort}`, use `asc=1` to make sort be `${sort}`

### General result field

`_id`

`updatedAt`

`createdAt`

### Query

list: request `/:projectName/:tablename` response `[{_id: ...}, ...]`。

count: request `/:projectName/:tablename/count` response `{count: ...}`。

detail: request `/:projectName/:tablename/:id` response `{_id: ...}`。
