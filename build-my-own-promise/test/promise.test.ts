import { default as Promise } from '@/promise'

describe('Promise', () => {
  it('执行器立即执行', () => {
    // 用例 given
    const helper = (callback: Function) =>
      new Promise(() => {
        callback()
      })

    // 触发 when
    const mockFn = jest.fn()
    helper(mockFn)

    // 验证 then
    expect(mockFn).toHaveBeenCalled()
  })

  it('执行器内部错误', () => {
    const helper = () =>
      new Promise(() => {
        throw new Error('error')
      })

    helper().then(undefined, (err) => {
      expect(err.message).toBe('error')
    })
  })

  it('同步调用 resolve', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve('data')
      })

    helper().then((data) => {
      expect(data).toBe('data')
    })
  })

  it('同步调用 reject', () => {
    const helper = () =>
      new Promise((resolve, reject) => {
        reject(new Error('error'))
      })

    helper().then(undefined, (err) => {
      expect(err.message).toBe('error')
    })
  })

  it('多次调用 resolve', () => {
    const helper = () =>
      new Promise((resolve) => {
        resolve('data1')
        resolve('data2')
        resolve('data3')
      })

    helper().then((data) => {
      expect(data).toBe('data1')
    })
  })

  it('多次调用 reject', () => {
    const helper = () =>
      new Promise((resolve, reject) => {
        reject(new Error('error1'))
        reject(new Error('error2'))
        reject(new Error('error3'))
      })

    helper().then(undefined, (err) => {
      expect(err.message).toBe('error1')
    })
  })

  it('异步调用 resolve', (done) => {
    const helper = () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('data')
        }, 1000)
      })

    helper().then((data) => {
      expect(data).toBe('data')
      done()
    })
  })

  it('异步调用 reject', (done) => {
    const helper = () =>
      new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('error'))
        }, 1000)
      })

    helper().then(undefined, (err) => {
      expect(err.message).toBe('error')
      done()
    })
  })
})
