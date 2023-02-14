const Promise = require('./resolve')

Promise.prototype.finally = function (finallyCallback) {
  return this.then(
    (data) => {
      // finallyCallback() 返回值被忽略，不参与 promise 链，只是执行函数，原来的 promise 链上的值原封不动的往下传
      // 原来的 promise 链是啥样还是啥样，只是多了一段必执行的回调函数（思维上不考虑它就行）
      return Promise.resolve(finallyCallback()).then(() => data)
    },
    (r) => {
      return Promise.resolve(finallyCallback()).then(() => {
        throw r
      })
    }
  )
}

module.exports = Promise
