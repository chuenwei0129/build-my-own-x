// Promise.any() 接收一个由 Promise 所组成的可迭代对象，该方法会返回一个新的 promise，
// 一旦可迭代对象内的任意一个 promise 变成了兑现状态，那么由该方法所返回的 promise 就会变成兑现状态，并且它的兑现值就是可迭代对象内的首先兑现的 promise 的兑现值。
// 如果可迭代对象内的 promise 最终都没有兑现（即所有 promise 都被拒绝了），那么该方法所返回的 promise 就会变成拒绝状态，
// 并且它的拒因会是一个 AggregateError 实例，这是 Error 的子类，用于把单一的错误集合在一起。

const Promise = require('./any')

describe('Promise.any', () => {
  it('有成功一个就返回第一个成功的那个', () => {
    const p1 = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('p1 error'))
      }, 1000)
    })

    const p2 = new Promise((resolve) => {
      setTimeout(() => {
        resolve('p2 sucess')
      }, 1000)
    })

    const p3 = new Promise((resolve) => {
      setTimeout(() => {
        resolve('p3 sucess')
      }, 500)
    })

    return Promise.any([p1, p2, p3]).then((value) => {
      expect(value).toBe('p3 sucess')
    })
  })

  it('空数组失败', () => {
    return Promise.any([]).then(undefined, (error) => {
      expect(error.message).toBe('All promises were rejected')
    })
  })

  it('全失败才返回失败', () => {
    const p1 = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('p1 error'))
      }, 500)
    })

    const p2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('p2 error'))
      }, 1000)
    })

    return Promise.any([p1, p2]).then(undefined, (err) => {
      expect(err.message).toBe('All promises were rejected')
    })
  })
})
