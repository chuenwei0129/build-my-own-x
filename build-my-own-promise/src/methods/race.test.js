// Promise.race(iterable) 方法返回一个 promise，一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。

const Promise = require('./race')

describe('Promise.race', () => {
  it('参数为空数组', () => {
    return Promise.race([]).then((value) => {
      expect(value).toBe(undefined)
    })
  })

  it('参数为 Promise 数组, 某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝', () => {
    // setTimeout 第三个参数就是给第一个函数传参数
    const p1 = new Promise((resolve) => {
      setTimeout(resolve, 500, 'p1')
    })

    const p2 = new Promise((resolve) => {
      setTimeout(resolve, 100, 'p2')
    })

    return Promise.race([p1, p2]).then((value) => {
      // Both resolve, but p2 is faster
      expect(value).toBe('p2')
    })
  })

  it('参数为 Promise 与非 Promise 的混合数组', () => {
    const p1 = new Promise((resolve) => {
      setTimeout(resolve, 500, 'p1')
    })

    const p2 = new Promise((resolve, reject) => {
      setTimeout(reject, 100, 'p2')
    })

    return Promise.race([p1, p2, 'p3', 'p4']).then((value) => {
      expect(value).toBe('p3')
    })
  })
})
