// 该Promise.allSettled()方法返回一个在所有给定的 promise 都已经fulfilled或rejected后的 promise，并带有一个对象数组，每个对象表示对应的 promise 结果。

const promise1 = Promise.resolve(3)
const promise2 = new Promise((resolve, reject) =>
  setTimeout(reject, 100, 'foo')
)
const promises = [promise1, promise2]

Promise.allSettled(promises).then((results) =>
  results.forEach((result) => console.log(result))
)

// expected output:
// { status: 'fulfilled', value: 3 }
// { status: 'rejected', reason: 'foo' }

const MyPromise = require('../promise')

MyPromise.allSettled = (it) => {
  return new MyPromise((resolve, reject) => {
    const ret = []
    let count = 0

    if (it.length === 0) resolve(ret)

    it.forEach((i) => {
      MyPromise.resolve(i).then(
        (data) => {
          ret.push({ status: 'fulfilled', value: data })
          ++count === it.length && resolve(ret)
        },
        (err) => {
          ret.push({ status: 'rejected', reason: err })
          ++count === it.length && resolve(ret)
        }
      )
    })
  })
}

const p1 = MyPromise.resolve(3)
const p2 = new MyPromise((resolve, reject) => setTimeout(reject, 100, 'foo'))
const ps = [p1, p2]

MyPromise.allSettled(ps).then((results) =>
  results.forEach((result) => console.log(result))
)

// { status: 'fulfilled', value: 3 }
// { status: 'rejected', reason: 'foo' }
