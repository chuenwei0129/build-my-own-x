const Promise = require('../promise')

// 参数是 Promise 实例时，直接返回
Promise.resolve = (p) =>
  p instanceof Promise
    ? p
    : new Promise((resolve) => {
        resolve(p)
      })

module.exports = Promise

// 拓展知识：类似 x === promise2
// const thenable = {
//   then: (resolve) => {
//     resolve(thenable)
//   },
// }

// Promise.resolve(thenable) // 这会造成一个死循环
