const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

const resolvePromise2 = (promise2, x, resolve, reject) => {
  if (x === promise2) {
    return reject(new TypeError('循环引用'))
  } else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    let called = false
    try {
      const then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            resolvePromise2(promise2, y, resolve, reject)
          },
          (r) => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    return resolve(x)
  }
}

const promiseResolveThenableJob = (resolvePromiseParam) => {
  return new MyPromise((_resolve) => {
    resolvePromiseParam.then((val) => _resolve(val))
  })
}

class MyPromise {
  constructor(exe) {
    this.state = PENDING
    this.value = undefined
    this.reason = undefined
    this.fulfilledCbs = []
    this.rejectedCbs = []

    const resolve = (value) => {
      const resolveGeneralValue = (value) => {
        if (this.state === PENDING) {
          this.state = FULFILLED
          this.value = value
          this.fulfilledCbs.forEach((cb) => cb())
        }
      }

      // resolve 参数为 promise 情况
      if (value instanceof MyPromise) {
        promiseResolveThenableJob(value).then(
          (val) => {
            if (val instanceof MyPromise) resolve(val)
            // 我们的栗子走得这，直接 resolve，消耗两次 then
            else resolveGeneralValue(val)
          },
          (err) => reject(err)
        )
      } else {
        resolveGeneralValue(value)
      }
    }

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = reason
        this.rejectedCbs.forEach((cb) => cb())
      }
    }

    try {
      exe(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onfullfiled, onrejected) {
    onfullfiled =
      typeof onfullfiled === 'function' ? onfullfiled : (value) => value
    onrejected =
      typeof onrejected === 'function'
        ? onrejected
        : (reason) => {
            throw reason
          }

    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        queueMicrotask(() => {
          try {
            const x = onfullfiled(this.value)
            resolvePromise2(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }

      if (this.state === REJECTED) {
        queueMicrotask(() => {
          try {
            const x = onrejected(this.reason)
            resolvePromise2(promise2, x, resolve, reject)
          } catch (err) {
            reject(err)
          }
        })
      }

      if (this.state === PENDING) {
        this.fulfilledCbs.push(() => {
          queueMicrotask(() => {
            try {
              const x = onfullfiled(this.value)
              resolvePromise2(promise2, x, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })

        this.rejectedCbs.push(() => {
          queueMicrotask(() => {
            try {
              const x = onrejected(this.reason)
              resolvePromise2(promise2, x, resolve, reject)
            } catch (err) {
              reject(err)
            }
          })
        })
      }
    })

    return promise2
  }
}

MyPromise.resolve = (p) => {
  return p instanceof MyPromise
    ? p
    : new MyPromise((resolve) => {
        resolve(p)
      })
}

module.exports = MyPromise
