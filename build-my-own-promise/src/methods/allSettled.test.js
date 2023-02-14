// Promise.allSettled() 方法以 promise 组成的可迭代对象作为输入，并且返回一个 Promise 实例。
// 当输入的所有 promise 都已敲定时（包括传递空的可迭代类型），返回的 promise 将兑现，并带有描述每个 promsie 结果的对象数组。
// 该方法与 Promise.all() 方法的区别在于，如果输入的迭代包含一个失败的 promise，该方法仍然会等待直到所有的 promise 都完成（无论成功或失败），
const Promise = require('./allSettled')

describe('Promise.allSettled', () => {
  it('Promise.allSettled([]) should return a promise', () => {
    const promise = Promise.allSettled([])
    expect(promise).toBeInstanceOf(Promise)
  })

  it('Promise.allSettled([]) should return a promise that resolved to an empty array', () => {
    const promise = Promise.allSettled([])
    return promise.then((res) => {
      expect(res).toEqual([])
    })
  })

  it('Promise.allSettled([p1, p2, p3]) should return a promise that resolved to an array of results, 遵循原数组顺序', () => {
    const p1 = Promise.resolve(1)
    const p2 = Promise.resolve(2)
    const p3 = Promise.resolve(3)
    const promise = Promise.allSettled([p1, p2, p3])
    return promise.then((res) => {
      expect(res).toEqual([
        { status: 'fulfilled', value: 1 },
        { status: 'fulfilled', value: 2 },
        { status: 'fulfilled', value: 3 },
      ])
    })
  })

  it('Promise.allSettled([p1, p2, p3]) should return a promise that resolved to an array of results, 遵循原数组顺序', () => {
    const p1 = Promise.resolve(1)
    const p2 = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(2)
      }, 500)
    })
    const p3 = new Promise((resolve, reject) => {
      reject(3)
    })
    const promise = Promise.allSettled([p1, p2, p3])
    return promise.then((res) => {
      expect(res).toEqual([
        { status: 'fulfilled', value: 1 },
        { status: 'rejected', reason: 2 },
        { status: 'rejected', reason: 3 },
      ])
    })
  })
})
