const Promise = require('./catch')

describe('Promise.prototype.catch', () => {
  it('Promise.catch', () => {
    const p = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('error'))
      }, 1000)
    })

    return p.catch((err) => {
      expect(err.message).toBe('error')
    })
  })
})
