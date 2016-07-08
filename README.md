# clannad
manage RESTful APIs for micro projects.

You will get data you needed, without back-end develop, just APIs.

![clannad](http://i2.piimg.com/567571/f54cc07c01cae98d.png)
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
  console.log(`need auth: ${authArr}`);
  return authArr.slice();
});

clannad.start(3000);
```

## Develop

```
$ make dev
```

## API

about all API's route, view [routes.js](https://github.com/youngerheart/restdaze/blob/master/routes.js)。

about all table field's detail, view [DB docs](https://github.com/youngerheart/restdaze/tree/master/schemas/README.md)。

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

### General result field

`_id`

`updatedAt`

`createdAt`

### Query

list: request `/:projectName/:tablename` response `[{_id: ...}, ...]`。

count: request `/:projectName/:tablename/count` response `{count: ...}`。

detail: request `/:projectName/:tablename/:id` response `{_id: ...}`。
