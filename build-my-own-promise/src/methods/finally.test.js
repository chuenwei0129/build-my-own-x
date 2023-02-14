// finally() 方法返回一个 Promise。在 promise 结束时，无论结果是 fulfilled 或者是 rejected，都会执行指定的回调函数。
// 这为在 Promise 是否成功完成后都需要执行的代码提供了一种方式。这避免了同样的语句需要在 then() 和 catch() 中各写一次的情况。
const Promise = require('./finally')

describe('Promise.prototype.finally', () => {
  test('在 promise 结束时, 结果是 fulfilled, 会执行指定的回调函数', () => {
    const finallyFn = jest.fn()
    const promise = new Promise((resolve) => {
      resolve('success')
    })
    return promise.finally(finallyFn).then((res) => {
      expect(res).toBe('success')
      expect(finallyFn).toBeCalled()
    })
  })

  test('在 promise 结束时, 结果是 rejected, 会执行指定的回调函数', () => {
    const finallyFn = jest.fn()
    const promise = new Promise((resolve, reject) => {
      reject('error')
    })
    return promise.finally(finallyFn).then(undefined, (res) => {
      expect(res).toBe('error')
      expect(finallyFn).toBeCalled()
    })
  })

  test('finally 参数为 `() => promise` 时, 会忽略参数中返回的 promise, 并且将原来的值原封不动的往下传', () => {
    // finallyFn 回调函数返回的 promise 被忽略
    const finallyFn = () => Promise.resolve(1314)
    const promise = Promise.resolve(520)
    return promise.finally(finallyFn).then((res) => {
      expect(res).toBe(520)
    })
  })
})
