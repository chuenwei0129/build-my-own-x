const resolvePromise2 = (then1Return, promise2, resolve2, reject2) => {
  if (then1Return === promise2) {
    // promise2 是内部包裹的 promise，是 then1 的返回值，then1Return 是 then1 第一个参数的返回值
    reject2(new TypeError('Chaining cycle detected for promise #<Promise>'))
  } else if (
    // thenable 对象
    then1Return !== null &&
    (typeof then1Return === 'object' || typeof then1Return === 'function')
  ) {
    // 配合 called 这个 flag，保证 resolve/reject 只有一次调用作用。
    let called = false
    try {
      //  处理取值出错问题
      // Object.defineProperty(then1Return, 'then', {
      //   get() {
      //     throw new Error('error')
      //   },
      // })
      const then = then1Return.then
      // then1Return 是 promise 对象
      if (typeof then === 'function') {
        // then.call 处理二次取值问题
        then.call(
          // this 指向
          then1Return,
          // onFulfilled, onRejected
          (value) => {
            // value 可能是 promise 对象，需要递归解包
            // 无论多少层都要先解包在装进 promise2 中
            if (called) return
            called = true
            resolvePromise2(value, promise2, resolve2, reject2)
          },
          (reason) => {
            if (called) return
            called = true
            reject2(reason)
          }
        )
      } else {
        // then1Return 是普通对象形如 { then: 1 }
        resolve2(then1Return)
      }
    } catch (error) {
      if (called) return
      called = true
      reject2(error)
    }
  } else {
    // then1Ret 是普通值, 直接 promise2 包裹一下，resolve2 往后传递，需要 then2 解包
    resolve2(then1Return)
  }
}

class MyPromise {
  _state = 'pending'
  _value = undefined
  _reason = undefined
  fulFilledCallbacks = new Set()
  rejectedCallbacks = new Set()

  constructor(executor) {
    const reject = (reason) => {
      if (this._state === 'pending') {
        this._state = 'rejected'
        this._reason = reason
        this.rejectedCallbacks.forEach((callback) => callback())
      }
    }

    const resolve = (value) => {
      if (this._state === 'pending') {
        this._state = 'fulfilled'
        this._value = value
        this.fulFilledCallbacks.forEach((callback) => callback())
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(onFulFilled, onRejected) {
    if (typeof onFulFilled !== 'function') {
      // If `onFulFilled` is not a function and `promise1` is fulfilled, `promise2` must be fulfilled with the same value
      // then 第一个参数不传，成功时，promise 链往后传递成功的值
      onFulFilled = (value) => value
    }

    if (typeof onRejected !== 'function') {
      // If `onRejected` is not a function and `promise1` is rejected, `promise2` must be rejected with the same reason
      // then 第二个参数不传，出错时，promise 链往后传递错误原因
      onRejected = (reason) => {
        throw reason
      }
    }

    const promise2 = new MyPromise((resolve2, reject2) => {
      if (this._state === 'fulfilled') {
        setTimeout(() => {
          // setTimeout 是利用事件循环，保证 resolvePromise2 可以拿到 then1 返回的 promise2
          try {
            // onFulFilled(this._value) 执行发生错误，对应 then1 第一个参数内部发生错误，需要抛出错误
            const then1Return = onFulFilled(this._value)
            resolvePromise2(then1Return, promise2, resolve2, reject2)
          } catch (error) {
            reject2(error)
          }
        })
      }

      if (this._state === 'rejected') {
        setTimeout(() => {
          try {
            const then1Return = onRejected(this._reason)
            resolvePromise2(then1Return, promise2, resolve2, reject2)
          } catch (error) {
            reject2(error)
          }
        })
      }

      if (this._state === 'pending') {
        this.fulFilledCallbacks.add(() => {
          setTimeout(() => {
            try {
              const then1Return = onFulFilled(this._value)
              resolvePromise2(then1Return, promise2, resolve2, reject2)
            } catch (error) {
              reject2(error)
            }
          })
        })

        this.rejectedCallbacks.add(() => {
          setTimeout(() => {
            try {
              const then1Return = onRejected(this._reason)
              resolvePromise2(then1Return, promise2, resolve2, reject2)
            } catch (error) {
              reject2(error)
            }
          })
        })
      }
    })

    return promise2
  }
}

// 辅助测试 resolveParamIsPromise，与 aplus 测试代码无关
MyPromise.resolve = (p) => {
  return p instanceof MyPromise
    ? p
    : new MyPromise((resolve) => {
        resolve(p)
      })
}

// aplus 测试套件
MyPromise.defer = MyPromise.deferred = function () {
  const dfd = {}
  dfd.promise = new MyPromise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}

module.exports = MyPromise
