// 测试 resolve 参数为 Promise

// 取消该注释，测试我们实现的更接近原生表现的 Promise 的执行顺序
// const Promise = require('./promise.es.js')
// 取消该注释，测试我们实现的 A+ 规范的 Promise 的执行顺序
const Promise = require('./promise.aplus.js')

new Promise((resolve) => {
  const resolveParamIsPromise = Promise.resolve()
  resolve(resolveParamIsPromise)
}).then(() => {
  console.log('after resolveParamIsPromise resolved')
})

Promise.resolve()
  .then(() => {
    console.log('promise1')
  })
  .then(() => {
    console.log('promise2')
  })
  .then(() => {
    console.log('promise3')
  })

// 原生 Promise 的执行顺序
// promise1
// promise2
// after resolveParamIsPromise resolved
// promise3
