const Promise = require('./resolve')

describe('Promise.resolve', () => {
  it('Promise.resolve 的参数为非 Promise 实例', () => {
    return Promise.resolve(520).then((data) => {
      expect(data).toBe(520)
    })
  })

  it('Promise.resolve 的参数为 Promise 实例', () => {
    const promise = new Promise((resolve) => {
      setTimeout(() => {
        resolve(520)
      }, 1000)
    })

    return Promise.resolve(promise).then((data) => {
      expect(data).toBe(520)
    })
  })
})
