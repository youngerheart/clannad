# 数据库

## project(项目)

| 字段名 | 类型 | 描述 |
| ---- | ------- | ----- |
| name | String | 权限验证名 |
| domains | StringArray | 跨域验证数组 |

## table(表)

| 字段名 | 类型 | 描述 |
| ---- | ------- | ----- |
| name | String | 集合名 |
| project | ObjectId | 所属项目 |
| fields | ObjectIdArray | 拥有的字段 |
| visitorAuth | BooleanArray | 游客权限 |
| userAuth | BooleanArray | 用户权限 |
| adminAuth | BooleanArray | 管理员权限 |

## field(字段)

| 字段名 | 类型 | 描述 |
| ---- | ------- | ----- |
| table | ObjectId | 所属表 |
| name | String | 字段名 |
| type | Mixed | 字段数据类型 |
| require | Boolean | 字段是否非空 |
| unique | Boolean | 字段是否唯一 |
| default | Mixed | 字段默认值 |
| validate | RegExp | 字段验证表达式 |
