const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('p1')
  }, 1000)
})

p1.then()
  // 相当于没有 finally 这一段，p1 按原来方式正常执行
  .finally(() => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 被忽略
        resolve(100)
      }, 2000)
    })
  })
  .then(val => console.log(val))

// 无论当前 Promise 是成功还是失败，调用 finally 之后都会执行 finally 中传入的函数，并且将值原封不动的往下传。
const MyPromise = require('./promise')

MyPromise.prototype.finally = function (cb) {
  return this.then(
    data => {
      return MyPromise.resolve(cb()).then(() => data)
    },
    r => {
      return MyPromise.resolve(cb()).then(() => {
        throw r
      })
    }
  )
}

const p2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('p2')
  }, 1000)
})

p2.then()
  // 相当于没有 finally 这一段，p1 按原来方式正常执行
  .finally(() => {
    return new MyPromise((resolve, reject) => {
      setTimeout(() => {
        // 被忽略
        resolve(100)
      }, 2000)
    })
  })
  .then(val => console.log(val))
