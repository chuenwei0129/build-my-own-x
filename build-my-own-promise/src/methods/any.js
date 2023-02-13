// 有成功一个就返回成功的那个，全失败才返回失败，空数组失败

const p1 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('p1'))
  }, 3000)
})

const p2 = new Promise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('p2'))
  }, 2000)
})

const p3 = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('p3')
  }, 1000)
})

Promise.any([p1, p2, p3]).then(value => {
  console.log(value) // p3
})

Promise.any([p1, p2])
  .then(value => {
    console.log(value) // p3
  })
  .catch(err => {
    // [AggregateError: All promises were rejected]
    console.log(err)
  })

const MyPromise = require('./promise')

MyPromise.any = it => {
  return new MyPromise((resolve, reject) => {
    let count = 0

    if (it.length === 0) reject(new Error('empty array'))

    it.forEach(i => {
      MyPromise.resolve(i).then(
        data => resolve(data),
        () => {
          ++count === it.length && reject('[AggregateError: All promises were rejected]')
        }
      )
    })
  })
}

const t1 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('p1'))
  }, 3000)
})

const t2 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    reject(new Error('p2'))
  }, 2000)
})

const t3 = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve('p3')
  }, 1000)
})

MyPromise.any([t1, t2, t3]).then(value => {
  console.log(value) // p3
})

MyPromise.any([t1, t2]).then(null, err => {
  // [AggregateError: All promises were rejected]
  console.log(err)
})
