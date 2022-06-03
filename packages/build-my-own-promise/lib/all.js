const promise1 = Promise.resolve(3)
const promise2 = 42
const promise3 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo')
})

Promise.all([promise1, promise2, promise3]).then(values => {
  console.log(values)
})

// expected output: Array [3, 42, "foo"]

Promise.all([]).then(values => {
  console.log(values) // []
})

const MyPromise = require('./promise')

MyPromise.all = it => {
  return new MyPromise((resolve, reject) => {
    const ret = []
    let count = 0
    if (it.length === 0) resolve(ret)

    it.forEach(i => {
      MyPromise.resolve(i).then(
        data => {
          ret.push(data)
          ++count === it.length && resolve(ret)
        },
        err => reject(err)
      )
    })
  })
}

const p1 = MyPromise.resolve(3)
const p2 = 42
const p3 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'foo')
})

MyPromise.all([p1, p2, p3]).then(values => {
  console.log(values)
})

// expected output: Array [3, 42, "foo"]

MyPromise.all([]).then(values => {
  console.log(values) // []
})

const resolve = value => {
  const resolveGeneralValue = value => {
    // 如果状态已经改变，则不再重复执行 resolve
    if (this.state === PENDING) {
      this.state = FULFILLED
      this.value = value
      this.fulfilledCbs.forEach(cb => cb())
    }
  }

  // resolveGeneralValue(value)

  // resolve 参数为 promise 情况
  if (value instanceof MyPromise) {
    promiseResolveThenableJob(value).then(
      val => {
        if (val instanceof MyPromise) resolve(val)
        // 我们的栗子走得这，直接 resolve，消耗两次 then
        else resolveGeneralValue(val)
      },
      err => reject(err)
    )
  } else {
    resolveGeneralValue(value)
  }
}
