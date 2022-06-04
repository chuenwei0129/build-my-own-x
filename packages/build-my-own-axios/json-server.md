# 简易入门<!-- omit in toc -->

- [安装](#安装)
- [启动](#启动)
- [相关启动参数](#相关启动参数)
- [随机生成模拟数据](#随机生成模拟数据)
- [路由](#路由)
  - [默认的路由](#默认的路由)
  - [自定义路由](#自定义路由)
- [自定义配置文件](#自定义配置文件)
- [过滤查询](#过滤查询)
- [分页查询](#分页查询)
- [排序](#排序)
- [任意切片数据](#任意切片数据)
- [全文检索](#全文检索)
- [实体关联](#实体关联)
  - [关联子实体](#关联子实体)
  - [关联父实体](#关联父实体)
- [其他高级用法](#其他高级用法)
  - [路由自定义](#路由自定义)
  - [自定义输出内容](#自定义输出内容)
  - [自定义用户校验](#自定义用户校验)

## 安装

```sh
npm install -g json-server
```

## 启动

db.json 文件的内容：

```json
{
  "posts": [{ "id": 1, "title": "json-server", "author": "acc" }],
  "comments": [{ "id": 1, "body": "some comment", "postId": 1 }],
  "profile": { "name": "acc" }
}
```

运行以下命令，把 db.json 文件托管成一个 web 服务。

```sh
json-server --watch --port 8090 db.json
```

输出类似以下内容，说明启动成功。

```js
\{^_^}/ hi!

Loading db.json
Done

Resources
http://localhost:8090/posts
http://localhost:8090/comments
http://localhost:8090/profile

Home
http://localhost:8090

Type s + enter at any time to create a snapshot of the database
Watching...
```

此时，你可以打开你的浏览器，然后输入：<http://localhost:8090> 测试。

## 相关启动参数

**语法：**

```sh
json-server [options] <source>
```

**选项列表：**

| 参数                | 简写 | 默认值                                                | 说明                             |
| ------------------- | ---- | ----------------------------------------------------- | -------------------------------- |
| \--config           | \-c  | 指定配置文件                                          | \[默认值: "json-server.json"\]   |
| \--port             | \-p  | 设置端口 \[默认值: 3000\]                             | Number                           |
| \--host             | \-H  | 设置域 \[默认值: "0.0.0.0"\]                          | String                           |
| \--watch            | \-w  | Watch file(s)                                         | 是否监听                         |
| \--routes           | \-r  | 指定自定义路由                                        |                                  |
| \--middlewares      | \-m  | 指定中间件 files                                      | \[数组\]                         |
| \--static           | \-s  | Set static files directory                            | 静态目录,类比：express的静态目录 |
| \--readonly         | \-ro | Allow only GET requests \[布尔\]                      |                                  |
| \--nocors           | \-nc | Disable Cross-Origin Resource Sharing \[布尔\]        |                                  |
| \--no               | gzip | , --ng Disable GZIP Content-Encoding \[布尔\]         |                                  |
| \--snapshots        | \-S  | Set snapshots directory \[默认值: "."\]               |                                  |
| \--delay            | \-d  | Add delay to responses (ms)                           |                                  |
| \--id               | \-i  | Set database id property (e.g. \_id) \[默认值: "id"\] |                                  |
| \--foreignKeySuffix | \--  | fks Set foreign key suffix (e.g. \_id as in post\_id) | \[默认值: "Id"\]                 |
| \--help             | \-h  | 显示帮助信息                                          | \[布尔\]                         |
| \--version          | \-v  | 显示版本号                                            | \[布尔\]                         |

## 随机生成模拟数据

启动命令：`json-server --watch app.js` 是把一个 js 文件返回的数据托管成 web 服务。

app.js 配合 [mockjs](https://github.com/nuysoft/Mock/wiki) 库（仅使用其随机生成数据功能）可以很方便生成模拟数据。

```js
// 仅使用 mockjs 生成随机数据

var Mock = require('mockjs');

module.exports = () => {
  // 使用 Mock
  var data = Mock.mock({
    'course|227': [
      {
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1000,
        course_name: '@ctitle(5,10)',
        autor: '@cname',
        college: '@ctitle(6)',
        'category_Id|1-6': 1
      }
    ],
    'course_category|6': [
      {
        "id|+1": 1,
        "pid": -1,
        cName: '@ctitle(4)'
      }
    ]
  });
  // 返回的 data 会作为 json-server 的数据
  return data;
};
```

## 路由

### 默认的路由

`GET`,`POST`, `PUT`, `PATCH` ,`DELETE` 等请求的 API 分别对应数据中的所有类型的实体如下：

```sh
# 获取所有的课程信息
GET    /course

# 获取 id=1001 的课程信息
GET    /course/1001

# 添加课程信息，请求body中必须包含 course 的属性数据，json-server 自动保存。
POST   /course

# 修改课程，请求 body 中必须包含 course 的属性数据
PUT    /course/1
PATCH  /course/1

# 删除课程信息
DELETE /course/1

# 获取具体课程信息id=1001
GET    /course/1001
```

### 自定义路由

当然你可以自定义路由：

```sh
json-server --watch --routes route.json db.json
```

`route.json`文件

```json
{
  "/api/*": "/$1",    //   /api/course   <==>  /course
  "/:resource/:id/show": "/:resource/:id",
  "/posts/:category": "/posts?category=:category",
  "/articles\\?id=:id": "/posts/:id"
}
```

## 自定义配置文件

通过命令行配置路由、数据文件、监控等会让命令变的很长，而且容易敲错，可以把命令写到 npm 的 scripts 中，但是依然配置不方便。

json-server 允许我们把所有的配置放到一个配置文件中，这个配置文件默认 `json-server.json`

例如:

```json
{
  "port": 80,  // 自定义服务监听端口
  "watch": true, // 服务监听
  "host": "api.xxx.com",// 指定域
  "static": "./public", // 静态文件目录，可以将项目的HTML,JS,IMG等资源放在这里
  "read-only": false,  // 是否只允许get请求
  "no-cors":false, // 是否允许跨域访问
  "no-gzip": false, // 是否可压缩
  "routes": "route.json" // 自定义路由，这个配置可以暂时省略，后续会有所涉及
}
```

使用配置文件启动 json-server:

```sh
# 默认使用：json-server.json 配置文件
json-server --watch app.js

# 指定自定义配置文件 setting.json
json-server --watch -c setting.json db.json
```

## 过滤查询

查询数据，可以额外提供

```sh
GET /posts?title=json-server&author=typicode
GET /posts?id=1&id=2

# 可以用 . 访问更深层的属性。
GET /comments?author.name=typicode
```

还可以使用一些判断条件作为过滤查询的辅助。

```sh
GET /posts?views_gte=10&views_lte=20
```

可以用的拼接条件为：

- `_gte` : 大于等于
- `_lte` : 小于等于
- `_ne` : 不等于
- `_like` : 包含

```sh
GET /posts?id_ne=1
GET /posts?id_lte=100
GET /posts?title_like=server
```

## 分页查询

默认后台处理分页参数为：`_page` 第几页，`_limit` 一页多少条。

```sh
GET /posts?_page=7
GET /posts?_page=7&_limit=20
```

> 默认一页 10 条。

后台会返回总条数，总条数的数据在响应头: `X-Total-Count` 中。

## 排序

- 参数：`_sort` 设定排序的字段
- 参数：`_order` 设定排序的方式（默认升序）

```sh
GET /posts?_sort=views&_order=asc
GET /posts/1/comments?_sort=votes&_order=asc
```

支持多个字段排序：

```sh
GET /posts?_sort=user,views&_order=desc,asc
```

## 任意切片数据

```sh
GET /posts?_start=20&_end=30
GET /posts/1/comments?_start=20&_end=30
GET /posts/1/comments?_start=20&_limit=10
```

## 全文检索

可以通过 `q` 参数进行全文检索，例如：`GET /posts?q=internet`

## 实体关联

### 关联子实体

包含 children 的对象, 添加 `_embed`

```sh
GET /posts?_embed=comments
GET /posts/1?_embed=comments
```

### 关联父实体

包含 parent 的对象, 添加 `_expand`

```sh
GET /comments?_expand=post
GET /comments/1?_expand=post
```

## 其他高级用法

`json-server` 本身就是依赖 express 开发而来，可以进行深度定制。细节就不展开，具体详情请参考[官网](https://github.com/typicode/json-server)。

### 路由自定义

```js
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)

server.get('/echo', (req, res) => {
  res.jsonp(req.query)
})

server.use(jsonServer.bodyParser)
server.use((req, res, next) => {
  if (req.method === 'POST') {
    req.body.createdAt = Date.now()
  }
  next()
})

server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})
```

### 自定义输出内容

```js
router.render = (req, res) => {
  res.jsonp({
    body: res.locals.data
  })
}
```

### 自定义用户校验

```js
const jsonServer = require('json-server')
const server = jsonServer.create()
const router = jsonServer.router('db.json')
const middlewares = jsonServer.defaults()

server.use(middlewares)

server.use((req, res, next) => {
 if (isAuthorized(req)) { // add your authorization logic here
   next() // continue to JSON Server router
 } else {
   res.sendStatus(401)
 }
})

server.use(router)
server.listen(3000, () => {
  console.log('JSON Server is running')
})
```
