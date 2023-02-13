// 原生
new Promise((resolve, reject) => {
  reject('error')
})
  .then(
    () => {
      console.log('ok 1')
    },
    err => {
      console.log('error 1: ' + err) // error 1: error
    }
  )
  // 2
  .then(
    val => {
      console.log('ok 2', val) // ok 2
    },
    err => {
      console.log('error 2: ' + err)
    }
  )
  // 3
  .catch(err => {
    console.log('catch 1: ' + err)
  })

// error 1: error
// ok 2 undefined

// 我的实现
const MyPromise = require('./promise')

MyPromise.prototype.catch = function (cb) {
  return this.then(null, cb)
}

new MyPromise((resolve, reject) => {
  reject('error')
})
  .then(
    () => {
      console.log('ok 1')
    },
    err => {
      console.log('error 1: ' + err) // error 1: error
    }
  )
  // 2
  .then(
    val => {
      console.log('ok 2', val) // ok 2
    },
    err => {
      console.log('error 2: ' + err)
    }
  )
  // 3
  .catch(err => {
    console.log('catch 1: ' + err)
  })

// error 1: error
// ok 2 undefined
