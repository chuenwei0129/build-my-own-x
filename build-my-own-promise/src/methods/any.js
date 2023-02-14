// 有成功一个就返回第一个成功的那个，全失败才返回失败，空数组失败
const Promise = require('./resolve')

Promise.any = (iterator) => {
  return new Promise((resolve, reject) => {
    if (iterator.length === 0) reject(new Error('All promises were rejected'))

    let count = 0
    iterator.forEach((p) => {
      Promise.resolve(p).then(
        (data) => resolve(data),
        () => {
          // 这里可以收集每次的错误，偷懒了
          if (++count === iterator.length)
            reject(new Error('All promises were rejected'))
        }
      )
    })
  })
}

module.exports = Promise
