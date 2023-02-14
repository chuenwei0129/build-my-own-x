# 源码拾遗：axios —— 极简封装的艺术<!-- omit in toc -->

- [json-server](#json-server)
- [axios 手写测试](#axios-手写测试)
- [axios 手写实现](#axios-手写实现)
- [axios 使用文档](#axios-使用文档)
  - [请求](#请求)
  - [响应](#响应)
  - [配置默认值](#配置默认值)
    - [全局的 `axios` 默认值](#全局的-axios-默认值)
    - [自定义实例默认值](#自定义实例默认值)
    - [配置的优先顺序](#配置的优先顺序)
  - [并发](#并发)
  - [创建实例](#创建实例)

## json-server

[json-server](https://github.com/typicode/json-server) 可以直接把一个 json 文件托管成一个具备全 RESTful 风格的 API，并支持跨域、jsonp、路由订制、数据快照保存等功能的 web 服务器。

**优点：**

1. 可以独立使用，也可以作为 node 服务的中间件 `server.use(db)`
2. db 可以是 json 文件(更直观)，也可以使 js 文件(灵活性更高)
3. 可以设置跨域、开启 gzip、设置延时、日志、指定路由等。`json-server [options] <source>`
4. 可命令行启动或 `json-server.json` 配置后直接启动
5. 可以自定义路由映射(key 为真实路由、value 为 mock 路由)
6. 增删改查模拟

**缺点：**

与接口管理工具相比，无法随着后端 API 的修改而自动修改

**用法：**

> [JSON Server 入门](./json-server.md)

## axios 手写测试

**在 [`examples`](./examples/) 目录中：** 使用 [live-server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 启动 `index.html` 测试。

**启动服务：**

```sh
# 测试 cancelToken 功能
npm run test:cancel
# 测试 axios 基础功能
npm run test:axios
```

## axios 手写实现

```js
function Axios(config) {
  this.defaults = config
  this.interceptors = {
    request: new InterceptorsManger(),
    response: new InterceptorsManger()
  }
}

// 发布订阅
function InterceptorsManger() {
  this.handlers = []
}

InterceptorsManger.prototype.use = function (onFulfilled, onRejected) {
  this.handlers.push({ onFulfilled, onRejected })
}

// 拦截器 promise 链逻辑
Axios.prototype.request = function (config) {
  let promise = Promise.resolve(config)

  // 此处 chains[0] 为成功回调，chains[1] 为失败回调
  let chains = [dispatchRequest, undefined] // undefined 占位

  // 处理拦截器
  this.interceptors.request.handlers.forEach(({ onFulfilled, onRejected }) => {
    // 进入 promise 栈，请求拦截应该在 dispatchRequest 前面处理 config
    chains.unshift(onFulfilled, onRejected)
  })

  this.interceptors.response.handlers.forEach(({ onFulfilled, onRejected }) => {
    // 进入 promise 队列，响应处理 应该在 dispatchRequest 后面
    chains.push(onFulfilled, onRejected)
  })

  // chains 循环
  while (chains.length > 0) {
    // 每次循环，promise 变成上一次的 promise 的结果
    promise = promise.then(chains.shift(), chains.shift())
  }

  // 这样就会在响应前形成一整条 promise 链，最终返回一个 promise
  return promise
}

// 发送 get 请求
Axios.prototype.get = function (url) {
  return this.request({
    method: 'GET',
    url
  })
}

// 发送 post 请求
Axios.prototype.post = function (config) {
  return this.request(config)
}

// 取消请求
Axios.prototype.cancelToken = function (exec) {
  let resolvePromise = null

  // abort 属性
  this.abort = new Promise(resolve => {
    resolvePromise = resolve
  })

  exec(() => resolvePromise())
}

function dispatchRequest(config) {
  return http(config)
}

// xhr 逻辑
function http(config) {
  const { method, url } = config

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)

    // 发送合适的请求头信息
    ;(method === 'POST' || method === 'PATCH') &&
      xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')

    // 发送请求
    method === 'GET' ? xhr.send() : xhr.send(config.data)

    // xhr 取消请求
    if (config.cancelToken) {
      config.cancelToken.abort.then(() => {
        xhr.abort()
      })
    }

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 304 || xhr.status === 201) {
        resolve({
          // 请求配置对象
          config,
          // 响应体
          data: JSON.parse(xhr.response),
          // 响应头
          Headers: xhr.getAllResponseHeaders(),
          // xhr 请求对象
          xhr,
          // 响应状态吗
          status: xhr.status,
          // 响应字符串
          statusText: xhr.statusText
        })
      } else {
        reject(new Error('请求失败'))
      }
    }
  })
}

// 非单例
function createInstance(config) {
  // 实例化对象，context 不是函数
  let context = new Axios(config)

  // 把 request 赋值给 instance
  // 此时 instance 是一个函数，可以调用
  // 做为函数调用，绑定 this 到 axios 实例上
  let instance = Axios.prototype.request.bind(context)

  // 将 Axios 实例属性和方法都添加到 instance 上
  Object.keys(Axios.prototype).forEach(key => {
    instance[key] = Axios.prototype[key].bind(context)
  })
  Object.keys(context).forEach(key => {
    instance[key] = context[key]
  })

  return instance
}
```

## axios 使用文档

### 请求

这些是创建请求时可以用的配置选项。只有 `url` 是必需的。**如果没有指定 `method`，请求将默认使用 `get` 方法**。

```js
{
   // `url` 是用于请求的服务器 URL
  url: '/user',

  // `method` 是创建请求时使用的方法
  method: 'get', // default

  // `baseURL` 将自动加在 `url` 前面，除非 `url` 是一个绝对 URL。
  // 它可以通过设置一个 `baseURL` 便于为 axios 实例的方法传递相对 URL
  baseURL: 'https://some-domain.com/api/',

  // `transformRequest` 允许在向服务器发送前，修改请求数据
  // 只能用在 'PUT', 'POST' 和 'PATCH' 这几个请求方法
  // 后面数组中的函数必须返回一个字符串，或 ArrayBuffer，或 Stream
  transformRequest: [function (data, headers) {
    // 对 data 进行任意转换处理
    return data;
  }],

  // `transformResponse` 在传递给 then/catch 前，允许修改响应数据
  transformResponse: [function (data) {
    // 对 data 进行任意转换处理
    return data;
  }],

  // `headers` 是即将被发送的自定义请求头
  headers: {'X-Requested-With': 'XMLHttpRequest'},

  // `params` 是即将与请求一起发送的 URL 参数
  // 必须是一个无格式对象(plain object)或 URLSearchParams 对象
  params: {
    ID: 12345
  },

   // `paramsSerializer` 是一个负责 `params` 序列化的函数
  // (e.g. https://www.npmjs.com/package/qs, http://api.jquery.com/jquery.param/)
  paramsSerializer: function(params) {
    return Qs.stringify(params, {arrayFormat: 'brackets'})
  },

  // `data` 是作为请求主体被发送的数据
  // 只适用于这些请求方法 'PUT', 'POST', 和 'PATCH'
  // 在没有设置 `transformRequest` 时，必须是以下类型之一：
  // - 通用：string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
  // - 浏览器专属：FormData, File, Blob
  // - Node 专属：Stream
  data: {
    firstName: 'Fred'
  },

  // `timeout` 指定请求超时的毫秒数(0 表示无超时时间)
  // 如果请求话费了超过 `timeout` 的时间，请求将被中断
  timeout: 1000,

   // `withCredentials` 表示跨域请求时是否需要使用凭证
  withCredentials: false, // default

  // `adapter` 允许自定义处理请求，以使测试更轻松
  // 返回一个 promise 并应用一个有效的响应 (查阅 [response docs](#response-api)).
  adapter: function (config) {
    /* ... */
  },

 // `auth` 表示应该使用 HTTP 基础验证，并提供凭据
  // 这将设置一个 `Authorization` 头，覆写掉现有的任意使用 `headers` 设置的自定义 `Authorization`头
  auth: {
    username: 'janedoe',
    password: 's00pers3cret'
  },

   // `responseType` 表示服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'
  responseType: 'json', // default

  // `responseEncoding` indicates encoding to use for decoding responses
  // Note: Ignored for `responseType` of 'stream' or client-side requests
  responseEncoding: 'utf8', // default

   // `xsrfCookieName` 是用作 xsrf token 的值的cookie的名称
  xsrfCookieName: 'XSRF-TOKEN', // default

  // `xsrfHeaderName` is the name of the http header that carries the xsrf token value
  xsrfHeaderName: 'X-XSRF-TOKEN', // default

   // `onUploadProgress` 允许为上传处理进度事件
  onUploadProgress: function (progressEvent) {
    // Do whatever you want with the native progress event
  },

  // `onDownloadProgress` 允许为下载处理进度事件
  onDownloadProgress: function (progressEvent) {
    // 对原生进度事件的处理
  },

   // `maxContentLength` 定义允许的响应内容的最大尺寸
  maxContentLength: 2000,

  // `validateStatus` 定义对于给定的 HTTP 响应状态码是 resolve 或 reject promise 。如果 `validateStatus` 返回 `true` (或者设置为 `null` 或 `undefined`)，promise 将被 resolve; 否则，promise 将被 reject
  validateStatus: function (status) {
    return status >= 200 && status < 300; // default
  },

  // `maxRedirects` 定义在 node.js 中 follow 的最大重定向数目
  // 如果设置为0，将不会 follow 任何重定向
  maxRedirects: 5, // default

  // `socketPath` defines a UNIX Socket to be used in node.js.
  // e.g. '/var/run/docker.sock' to send requests to the docker daemon.
  // Only either `socketPath` or `proxy` can be specified.
  // If both are specified, `socketPath` is used.
  socketPath: null, // default

  // `httpAgent` 和 `httpsAgent` 分别在 node.js 中用于定义在执行 http 和 https 时使用的自定义代理。允许像这样配置选项：
  // `keepAlive` 默认没有启用
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),

  // 'proxy' 定义代理服务器的主机名称和端口
  // `auth` 表示 HTTP 基础验证应当用于连接代理，并提供凭据
  // 这将会设置一个 `Proxy-Authorization` 头，覆写掉已有的通过使用 `header` 设置的自定义 `Proxy-Authorization` 头。
  proxy: {
    host: '127.0.0.1',
    port: 9000,
    auth: {
      username: 'mikeymike',
      password: 'rapunz3l'
    }
  },

  // `cancelToken` 指定用于取消请求的 cancel token
  // （查看后面的 Cancellation 这节了解更多）
  cancelToken: new CancelToken(function (cancel) {
  })
}
```

### 响应

某个请求的响应包含以下信息

```js
{
  // `data` 由服务器提供的响应
  data: {},

  // `status` 来自服务器响应的 HTTP 状态码
  status: 200,

  // `statusText` 来自服务器响应的 HTTP 状态信息
  statusText: 'OK',

  // `headers` 服务器响应的头
  headers: {},

   // `config` 是为请求提供的配置信息
  config: {},
 // 'request'
  // `request` is the request that generated this response
  // It is the last ClientRequest instance in node.js (in redirects)
  // and an XMLHttpRequest instance the browser
  request: {}
}
```

### 配置默认值

你可以指定将被用在各个请求的配置默认值

#### 全局的 `axios` 默认值

```js
axios.defaults.baseURL = 'https://api.example.com';
axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
```

#### 自定义实例默认值

```js
// Set config defaults when creating the instance
const instance = axios.create({
  baseURL: 'https://api.example.com'
});

// Alter defaults after instance has been created
instance.defaults.headers.common['Authorization'] = AUTH_TOKEN;
```

#### 配置的优先顺序

配置会以一个优先顺序进行合并。这个顺序是：在 `lib/defaults.js` 找到的库的默认值，然后是实例的 `defaults` 属性，最后是请求的 `config` 参数。后者将优先于前者。这里是一个例子：

```js
// 使用由库提供的配置的默认值来创建实例
// 此时超时配置的默认值是 `0`
var instance = axios.create();

// 覆写库的超时默认值
// 现在，在超时前，所有请求都会等待 2.5 秒
instance.defaults.timeout = 2500;

// 为已知需要花费很长时间的请求覆写超时设置
instance.get('/longRequest', {
  timeout: 5000
});
```

### 并发

```js
function getUserAccount() {
  return axios.get('/user/12345');
}

function getUserPermissions() {
  return axios.get('/user/12345/permissions');
}

// axios.all(iterable)
// axios.spread(callback)

axios.all([getUserAccount(), getUserPermissions()])
  .then(axios.spread(function (acct, perms) {
    // 两个请求现在都执行完成
  }));
```

### 创建实例

可以使用自定义配置新建一个 `axios` 实例, 也就是每个新 `axios` 都有自己的配置

新 `axios` 只是没有取消请求和批量发请求的方法, 其它所有语法都是一致的

为什么要设计这个语法?

(1) 需求: 项目中有部分接口需要的配置与另一部分接口需要的配置不太一样, 如何处理?
(2) 解决: 创建 2 个新 `axios`, 每个都有自己特有的配置, 分别应用到不同要求的接口请求中

```js
// axios.create([config])
const instance1 = axios.create({
  baseURL: 'https://some-domain.com/api/',
  timeout: 1000,
  headers: {'X-Custom-Header': 'foo'}
});

const instance2 = axios.create({
  baseURL: 'https://else-domain.com/api/',
  timeout: 2000,
  headers: {'X-Custom-Header': 'bar'}
});
```
