// Promise.race(iterable) 方法返回一个 promise，一旦迭代器中的某个 promise 解决或拒绝，返回的 promise 就会解决或拒绝。

const promise1 = new Promise((resolve, reject) => {
  setTimeout(resolve, 500, 'one')
})

const promise2 = new Promise((resolve, reject) => {
  setTimeout(resolve, 100, 'two')
})

Promise.race([promise1, promise2]).then(value => {
  console.log(value)
  // Both resolve, but promise2 is faster
})
// expected output: "two"

Promise.race([1, 2]).then(value => {
  console.log(value)
  // Both resolve, but promise2 is faster
})

console.log('hello world')

const MyPromise = require('./promise')

// 不关心先后顺序，不需要计数器
MyPromise.race = it => {
  return new MyPromise((resolve, reject) => {
    if (proms.length === 0) resolve()
    it.forEach(i =>
      MyPromise.resolve(i).then(
        data => resolve(data),
        err => reject(err)
      )
    )
  })
}

const p1 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 500, 'one')
})

const p2 = new MyPromise((resolve, reject) => {
  setTimeout(resolve, 100, 'two')
})

MyPromise.race([p1, p2]).then(value => {
  console.log(value)
  // Both resolve, but promise2 is faster
})
// expected output: "two"

MyPromise.race([1, 2]).then(value => {
  console.log(value)
  // Both resolve, but promise2 is faster
})

console.log('hello world')
