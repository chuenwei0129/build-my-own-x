// Promise.all() 方法接收一个 promise 的 iterable 类型（注：Array，Map，Set 都属于 ES6 的 iterable 类型）的输入，
// 并且只返回一个Promise实例，那个输入的所有 promise 的 resolve 回调的结果是一个数组。
// 这个Promise的 resolve 回调执行是在所有输入的 promise 的 resolve 回调都结束，或者输入的 iterable 里没有 promise 了的时候。
// 它的 reject 回调执行是，只要任何一个输入的 promise 的 reject 回调执行或者输入不合法的 promise 就会立即抛出错误，
// 并且 reject 的是第一个抛出的错误信息。
// MDN

const Promise = require('./all')

describe('Promise.all', () => {
  it('Promise.all([]) should return a promise', () => {
    const promise = Promise.all([])
    expect(promise).toBeInstanceOf(Promise)
  })

  it('Promise.all([]) should return a promise that resolved to an empty array', () => {
    const promise = Promise.all([])
    return promise.then((res) => {
      expect(res).toEqual([])
    })
  })

  it('Promise.all([p1, p2, p3]) should return a promise that resolved to an array of results', () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    const p3 = Promise.resolve(3)
    const promise = Promise.all([p1, p2, p3])
    return promise.then((res) => {
      expect(res).toEqual([1, 2, 3])
    })
  })

  it('Promise.all([p1, p2, p3]) should return a promise that first reject if one of the promises reject', () => {
    const p1 = Promise.resolve(1)
    const p2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(2)
      }, 500)
    })
    const p3 = new Promise((resolve, reject) => {
      reject(3)
    })
    const promise = Promise.all([p1, p2, p3])
    return promise.then(undefined, (err) => {
      expect(err).toBe(3)
    })
  })

  it('Promise.all([p1, p2, p3]) 回调的结果遵循原数组顺序', () => {
    const p1 = new Promise((resolve) => {
      setTimeout(() => {
        resolve(1)
      }, 1000)
    })
    const p2 = 2
    const p3 = new Promise((resolve) => {
      setTimeout(() => {
        resolve(3)
      }, 500)
    })
    const promise = Promise.all([p1, p2, p3])
    return promise.then((res) => {
      expect(res).toEqual([1, 2, 3])
    })
  })
})
