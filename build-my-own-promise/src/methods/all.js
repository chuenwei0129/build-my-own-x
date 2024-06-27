const Promise = require('./resolve')

Promise.all = (it) => {
  return new Promise((resolve, reject) => {
    if ([...it].length === 0) resolve([])

    const res = []
    let index = 0
    for (const [key, val] of it.entries()) {
      Promise.resolve(val).then(
        (data) => {
          res.push([key, data])
          if (++index === it.length) {
            resolve(
              res.sort((a, b) => a.at(0) - b.at(0)).map((item) => item.at(1))
            )
          }
        },
        (err) => reject(err)
      )
    }
  })
}

module.exports = Promise
