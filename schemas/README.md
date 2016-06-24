# 数据库

## project(项目)

| 字段名 | 类型 | 描述 |
| ---- | ------- | ----- |
| name | String | 权限验证名 |
| domains | StringArray | 跨域验证数组 |

## collection(集合)

| 字段名 | 类型 | 描述 |
| ---- | ------- | ----- |
| name | String | 集合名 |
| project | ObjectId | 所属项目 |
| adminAuth | BooleanArray | 管理员权限 |
| userAuth | BooleanArray | 用户权限 |

## source(资源)

| 字段名 | 类型 | 描述 |
| ---- | ------- | ----- |
| collection | ObjectId | 所属集合 |
| data | Object | 数据键值对 |
