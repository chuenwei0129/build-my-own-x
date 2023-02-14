const Promise = require('./resolve')

Promise.allSettled = (it) => {
  return new Promise((resolve) => {
    const res = []
    if (it.length === 0) resolve(res)

    let count = 0
    for (const [key, val] of it.entries()) {
      Promise.resolve(val).then(
        (data) => {
          res.push([key, { status: 'fulfilled', value: data }])
          if (++count === it.length) {
            resolve(
              res.sort((a, b) => a.at(0) - b.at(0)).map((item) => item.at(1))
            )
          }
        },
        (err) => {
          // 错误处理简单化，不实现细节
          res.push([key, { status: 'rejected', reason: err }])
          if (++count === it.length) {
            resolve(
              res.sort((a, b) => a.at(0) - b.at(0)).map((item) => item.at(1))
            )
          }
        }
      )
    }
  })
}

module.exports = Promise
