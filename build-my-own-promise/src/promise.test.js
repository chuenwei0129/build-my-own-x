// ⚠️ 注意事项：
// 因为测试的是我们自己实现的 Promise，所以这里 async/await 不能用，.resolves/.rejects 也不能用。
// 我们手写的 Promise 的类型定义与原生 Promise 类型并不一致，所以会发生类型错误，但是实际上是可以运行的，所以这里用 @ts-nocheck 忽略掉。
// @ts-nocheck

// 运行 `pnpm t` 测试，注释此行，可以对比原生 Promise 行为
const Promise = require('./promise')

describe('Promise', () => {
  it('执行器立即执行', () => {
    const helper = (callback) =>
      new Promise(() => {
        callback()
      })

    const mockFn = jest.fn()
    helper(mockFn)

    expect(mockFn).toHaveBeenCalled()
  })

  it('执行器内部出错', () => {
    const helper = () =>
      new Promise(() => {
        throw new Error('886')
      })

    // 这里必须 return，否则内部实现 then 返回 Promise2 时，测试用例将无法执行
    return helper().then(undefined, (err) => {
      expect(err.message).toBe('886')
    })
  })

  it('同步调用 resolve', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    return helper().then((data) => {
      expect(data).toBe(520)
    })
  })

  it('同步调用 reject', () => {
    const helper = () =>
      new Promise((resolve, reject) => {
        reject(new Error('886'))
      })

    return helper().then(undefined, (err) => {
      expect(err.message).toBe('886')
    })
  })

  it('多次调用 resolve', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve(520)
        resolve(521)
        resolve(522)
      })

    return helper().then((data) => {
      expect(data).toBe(520)
    })
  })

  it('多次调用 reject', () => {
    const helper = () =>
      new Promise((resolve, reject) => {
        reject(new Error('886'))
        reject(new Error('887'))
        reject(new Error('888'))
      })

    return helper().then(undefined, (err) => {
      expect(err.message).toBe('886')
    })
  })

  it('异步调用 resolve', () => {
    const helper = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(520)
        }, 1000)
      })

    return helper().then((data) => {
      expect(data).toBe(520)
    })
  })

  it('异步调用 reject', () => {
    const helper = () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('886'))
        }, 1000)
      })

    return helper().then(undefined, (err) => {
      expect(err.message).toBe('886')
    })
  })

  it('同步调用下, then 第一个参数传递函数, 函数内部发生错误时', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    return helper()
      .then(() => {
        throw new Error('886')
      })
      .then(undefined, (r) => {
        expect(r.message).toBe('886')
      })
  })

  it('异步调用下成功时, then 第一个参数传递函数, 函数内部发生错误时', () => {
    const helper = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve(520)
        }, 1000)
      })

    return helper()
      .then(() => {
        throw new Error('886')
      })
      .then(undefined, (r) => {
        expect(r.message).toBe('886')
      })
  })

  it('异步调用下失败时, then 第二个参数传递函数, 函数内部发生错误时', () => {
    const helper = () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('error'))
        }, 1000)
      })

    return helper()
      .then(undefined, () => {
        throw new Error('886')
      })
      .then(undefined, (r) => {
        expect(r.message).toBe('886')
      })
  })

  it('then 第一个参数传递函数, 函数返回值为非 Promise 实例 或 thenable 对象时', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    return helper()
      .then(() => 1314)
      .then((data) => {
        expect(data).toBe(1314)
      })
  })

  // promise2 是内部包裹的 promise，是 then1 的返回值，then1Return 是 then1 第一个参数的返回值
  it('then 第一个参数传递函数, 函数返回值为 promise2 时', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    const promise2 = helper().then(() => {
      return promise2
    })

    return promise2.then(undefined, (r) => {
      expect(r.message).toBe('Chaining cycle detected for promise #<Promise>')
    })
  })

  it('then 第一个参数传递函数, 函数返回值为 thenable 时', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    return helper()
      .then(() => ({ then: 1314 }))
      .then((data) => {
        expect(data).toEqual({ then: 1314 })
      })
  })

  it('then 第一个参数传递函数, 函数返回值为 Promise 实例时', () => {
    const p1 = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    const p2 = () =>
      new Promise((resolve) => {
        resolve(1314)
      })

    return p1()
      .then(() => p2())
      .then((data) => {
        expect(data).toBe(1314)
      })
  })

  it(' then 第一个参数传递函数, 函数返回值为 Promise 实例时，且该实例抛出错误', () => {
    const p1 = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    const p2 = () =>
      new Promise(() => {
        throw new Error('886')
      })

    return p1()
      .then(() => p2())
      .then(undefined, (r) => {
        expect(r.message).toBe('886')
      })
  })

  it('then 第一个参数传递函数, 函数返回值为 Promise 实例时, 且该实例 then 方法被代理', () => {
    const p1 = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    const p2 = () => {
      const p = new Promise((resolve) => {
        resolve(1314)
      })

      Object.defineProperty(p, 'then', {
        get: () => {
          throw new Error('then 方法被代理')
        },
      })

      return p
    }

    return p1()
      .then(() => p2())
      .then(undefined, (r) => {
        expect(r.message).toBe('then 方法被代理')
      })
  })

  it('then 第一个参数传递函数, 函数返回值为 Promise 实例时, 且该实例 resolve 值也为 Promise 实例', () => {
    const p1 = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    const p2 = () =>
      new Promise((resolve) => {
        resolve(p3())
      })

    const p3 = () =>
      new Promise((resolve) => {
        resolve(1314)
      })

    return p1()
      .then(() => p2())
      .then((data) => {
        expect(data).toBe(1314)
      })
  })

  it('then 第一个参数不传或传递非函数, 成功时, promise 链往后传递成功的值', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve(520)
      })

    return helper()
      .then(undefined)
      .then((data) => {
        expect(data).toBe(520)
      })
  })

  it('then 第二个参数不传或传递非函数, 出错时, promise 链往后传递错误原因', () => {
    const helper = () =>
      new Promise(() => {
        throw new Error('886')
      })

    return helper()
      .then()
      .then(undefined, (r) => {
        expect(r.message).toBe('886')
      })
  })

  it('then 第二个参数传递函数, 出错时, promise 链会丢失 then1 的错误, promise 链 then2 恢复正确', () => {
    const helper = () =>
      new Promise(() => {
        throw new Error('886')
      })

    return helper()
      .then(undefined, () => 520)
      .then((data) => {
        expect(data).toBe(520)
      })
  })
})
