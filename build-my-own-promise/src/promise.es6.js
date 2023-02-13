const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

const resolvePromise2 = (promise2, x, resolve, reject) => {
  if (x === promise2) {
    // x 是 promise2，那就无法用 resolve 来处理参数
    return reject(new TypeError('循环引用'))
  }
  // 是否是 thenable
  else if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    // 如果是 promise 已经 then 处理过了，就没必要自动执行 then 了，相当于用户手动调用 then
    let called = false
    // try 处理取值 Object.defineProperty 问题
    try {
      const then = x.then
      if (typeof then === 'function') {
        // x 为 promise 时，会自动改变它的状态，x.then(y => ...) 再用 promise2 容器接收 y 传递的参数，并通过 resolve(y) 传递出去
        // 但由于 y 可能是 promise，resolve(y) 需要处理，所以需要递归调用 resolvePromise2
        // then.call 是为了防止二次取值报错问题
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
        // 可能是 { then: 1 }
        resolve(x)
      }
    } catch (e) {
      if (called) return // 如果已经调用了 reject，那就不再调用 reject
      called = true
      reject(e)
    }
  } else {
    // 调用容器的 resolve 传递参数
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
        // 如果状态已经改变，则不再重复执行 resolve
        if (this.state === PENDING) {
          this.state = FULFILLED
          this.value = value
          this.fulfilledCbs.forEach((cb) => cb())
        }
      }

      resolveGeneralValue(value)

      // resolve 参数为 promise 情况
      // if (value instanceof MyPromise) {
      //   promiseResolveThenableJob(value).then(
      //     val => {
      //       if (val instanceof MyPromise) resolve(val)
      //       // 我们的栗子走得这，直接 resolve，消耗两次 then
      //       else resolveGeneralValue(val)
      //     },
      //     err => reject(err)
      //   )
      // } else {
      //   resolveGeneralValue(value)
      // }
    }

    const reject = (reason) => {
      if (this.state === PENDING) {
        this.state = REJECTED
        this.reason = reason
        this.rejectedCbs.forEach((cb) => cb())
      }
    }

    // 执行器抛出错误
    try {
      exe(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then(onfullfiled, onrejected) {
    // 参数默认值
    onfullfiled =
      typeof onfullfiled === 'function' ? onfullfiled : (value) => value
    onrejected =
      typeof onrejected === 'function'
        ? onrejected
        : (reason) => {
            // If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected with the same reason
            throw reason
          }

    // then 返回一个新的 promise 容器，函数式编程
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.state === FULFILLED) {
        // setTimeout 是利用 JS 事件循环，模拟微任务，保证 promise2 可以拿到
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

// 实现一个 Promise.resolve
MyPromise.resolve = (param) => {
  return param instanceof MyPromise
    ? param
    : new MyPromise((resolve) => {
        resolve(param)
      })
}

// 测试 resolve Promise
// new MyPromise(resolve => {
//   let resolvedPromise = MyPromise.resolve()
//   resolve(resolvedPromise)
// }).then(() => {
//   console.log('resolvePromise resolved')
// })

// MyPromise.resolve()
//   .then(() => {
//     console.log('promise1')
//   })
//   .then(() => {
//     console.log('promise2')
//   })
//   .then(() => {
//     console.log('promise3')
//   })

// promise1
// promise2
// resolvePromise resolved
// promise3

// 测试代码
MyPromise.defer = MyPromise.deferred = function () {
  const dfd = {}
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = MyPromise
