// 原生
Promise.resolve(1).then(val => {
  console.log(val)
})

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve(99)
  })
})

Promise.resolve(p).then(val => {
  console.log(val)
})

// 1
// 99

// 我的实现
const MyPromise = require('./promise')

MyPromise.resolve = param => {
  // 这里偷懒了
  return param instanceof Promise
    ? param
    : new MyPromise((resolve, reject) => {
        resolve(param)
      })
}

MyPromise.resolve(1).then(val => {
  console.log(val)
})

const myp = new MyPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(99)
  })
})

Promise.resolve(myp).then(val => {
  console.log(val)
})

// 1
// 99

// 补充说明：
// 类似 x === promise2
let thenable = {
  then: (resolve, reject) => {
    resolve(thenable)
  }
}

Promise.resolve(thenable) //这会造成一个死循环
