function Axios(config) {
  this.defaults = config
  this.interceptors = {
    request: new InterceptorsManger(),
    response: new InterceptorsManger(),
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
    url,
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
  this.abort = new Promise((resolve) => {
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
          statusText: xhr.statusText,
        })
      } else {
        reject(new Error('请求失败'))
      }
    }
  })
}

function createInstance(config) {
  // 实例化对象，context 不是函数
  let context = new Axios(config)

  // 把 request 赋值给 instance
  // 此时 instance 是一个函数，可以调用
  // 做为函数调用，绑定 this 到 axios 实例上
  let instance = Axios.prototype.request.bind(context)

  // 将 Axios 实例属性和方法都添加到 instance 上
  Object.keys(Axios.prototype).forEach((key) => {
    instance[key] = Axios.prototype[key].bind(context)
  })
  Object.keys(context).forEach((key) => {
    instance[key] = context[key]
  })

  return instance
}
