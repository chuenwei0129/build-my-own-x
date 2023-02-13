const Promise = require('./resolve')

// 不关心先后顺序，不需要计数器
Promise.race = (it) => {
  return new Promise((resolve, reject) => {
    if ([...it].length === 0) resolve()

    it.forEach((p) =>
      Promise.resolve(p).then(
        (data) => resolve(data),
        (err) => reject(err)
      )
    )
  })
}

module.exports = Promise
