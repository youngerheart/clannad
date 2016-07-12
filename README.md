[![NPM version](https://img.shields.io/npm/v/clannad.svg)](https://www.npmjs.com/package/clannad) [![Downloads](https://img.shields.io/npm/dm/clannad.svg)](http://badge.fury.io/js/clannad)

#clannad

manage RESTful APIs for micro projects.

You will get data you needed, without back-end develop, just APIs.

![clannad](http://ww1.sinaimg.cn/large/0060lm7Tgw1f5mjbjqhckj316e0fkafh.jpg)
みんな　みんな　あわせで　ひゃくにんかぞく 

## How it works

![how it works](http://i2.piimg.com/567571/404987cefe28abf7.png)

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

clannad.auth((authArr) => {
  // return authArr by your auth system, or return itself while don't need auth system
  return authArr.slice();
});

clannad.app.use(...) // clannad's koa app
clannad.app.listen(3000, () => {
  process.stderr.write(`Server running at http://localhost:3000\n`);
});
```

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

*disabled while query by id*

`limit` default 30

`offset` default 0

`asc` default sort is `-updatedAt`, use `asc=1` to make sort be `updateAt`

### General result field

`_id`

`updatedAt`

`createdAt`

### Query

list: request `/:projectName/:tablename` response `[{_id: ...}, ...]`。

count: request `/:projectName/:tablename/count` response `{count: ...}`。

detail: request `/:projectName/:tablename/:id` response `{_id: ...}`。
