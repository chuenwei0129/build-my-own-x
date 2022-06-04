# `build-my-own-promise`

## Usage

> [An open standard for sound, interoperable JavaScript promises](https://promisesaplus.com/)

通过上面的地址，可以查看规范内容。

通过 npm install [promises-aplus-tests](https://github.com/promises-aplus/promises-tests)，可以下载测试套件。

```json
{
    "devDependencies": {
        "promises-aplus-tests": "*"
    },
    "scripts": {
        "test": "promises-aplus-tests lib/promise"
    }
}
```

通过 `npm run test` 运行测试套件。

## Promises/A+ 规范实现

**🎯 实现：**

> [可以点击查看全部源码](https://github.com/chuenwei0129/build-my-own-x/blob/main/packages/build-my-own-promise/lib/promise.js)

**🤔 思考：**

**从函数式编程的角度来理解 Promise 的实现：** 把 Promise 看做一个封装了异步数据的 Monad，其 then 接口就相当于这个 Monad 的 map 方法。这样一来，Promise 也可以理解为一个特殊的对象，**这个对象通过一个函数获取数据，并通过另一个函数来操作数据。**

**🦐 常用方法实现：** [lib](https://github.com/chuenwei0129/build-my-own-x/tree/main/packages/build-my-own-promise/lib)

**⚠️ 注意事项：**

- **promise** 是一个包含 then 方法的对象或函数，**该方法符合规范指定的行为**。
- **thenable** 是一个包含 then 方法和对象或者函数。

## 如何确定 JS 中链式调用 Promise.then() 的执行顺序问题？

```js
// 以下代码每一步是怎么执行的？为什么输出的结果是 1 3 2 4 ?

Promise.resolve()
    .then(() => console.log(1))
    .then(() => console.log(2))

Promise.resolve()
    .then(() => console.log(3))
    .then(() => console.log(4))
```

可以用显示的 queueMicrotask 函数来添加 microtask 来模拟

```js
// 执行步骤

// task 执行
// queueMicrotask 触发器 1 会把回调添加到微任务队列
// queueMicrotask 触发器 3 会把回调添加到微任务队列
// 微任务队列开始执行
// 打印 1，queueMicrotask 触发器 2 会把回调添加到微任务队列
// 打印 3，queueMicrotask 触发器 4 会把回调添加到微任务队列
// 打印 2，打印 4

queueMicrotask(() => { // 1
  console.log(1)
  queueMicrotask(() => { // 2
    console.log(2)
  })
})

queueMicrotask(() => { // 3
  console.log(3)
  queueMicrotask(() => { // 4
    console.log(4)
  })
})
```

## 只有面试会考的 resolve 参数为 promise 的处理方法

**测试代码：**

```js
new Promise(resolve => {
  let resolvedPromise = Promise.resolve()
  resolve(resolvedPromise)
}).then(() => {
  console.log('resolvePromise resolved')
})

Promise.resolve()
  .then(() => {
    console.log('promise1')
  })
  .then(() => {
    console.log('promise2')
  })
  .then(() => {
    console.log('promise3')
  })

// 打印顺序
// promise1
// promise2
// resolvePromise resolved
// promise3
```

用我们实现的 MyPromise 测试

```js
// 打印顺序
// resolvePromise resolved
// promise1
// promise2
// promise3
```

这是因为 Promises/A+ 规范跟 ES2015 Promises 不完全等价。

[ECMA262 Promise 构造函数](https://tc39.es/ecma262/#sec-promise-constructor)中，注意事项里提到：

> The argument passed to the resolve function represents the eventual value of the deferred action and can be either the actual fulfillment value or another Promise object which will provide the value if it is fulfilled.
>
> 传递给 resolve 函数的参数表示延迟动作的最终值，可以是实际的值，也可以是其他 Promise 对象，如果是 Promise，则当该 Promise 对象 fulfilled 之后将向 resolve 函数提供最终值。

在我们实现的 promise 上添加如下内容，可以实现与 ES2015 Promises 等价的效果。

```js
// 添加外部工具函数 promiseResolveThenableJob
const promiseResolveThenableJob = resolvePromiseParam => {
  return new MyPromise(_resolve => {
    resolvePromiseParam.then(val => _resolve(val))
  })
}

// 对 constructor 中 resolve 函数做如下修改
const resolve = value => {
  const resolveGeneralValue = value => {
    // 如果状态已经改变，则不再重复执行 resolve
    if (this.state === PENDING) {
      this.state = FULFILLED
      this.value = value
      this.fulfilledCbs.forEach(cb => cb())
    }
  }

  // resolve 参数为 promise 情况
  if (value instanceof MyPromise) {
    promiseResolveThenableJob(value).then(
      val => {
        if (val instanceof MyPromise) resolve(val)
        // 我们的栗子走得这，会消耗两次 then，resolve 的是 val，this.value = val
        else resolveGeneralValue(val)
      },
      err => reject(err)
    )
  } else {
    resolveGeneralValue(value)
  }
}
```

**解释：**

测试代码执行 `resolve(resolvedPromise)` 会命中 `resolvedPromise instanceof MyPromise === true`，会执行 `promiseResolveThenableJob(value)`。

该函数返回值是一个新的 Promise 实例，函数内部会立即执行 `resolvePromiseParam.then(val => _resolve(val))`，这就表示新的 promise 实例通过 _resolve 获取到了 resolvePromiseParam fulfilled 后的数据。

接下来会进入 `promiseResolveThenableJob(value).then` 逻辑处理 `_resolve` 到的数据 val，由于我们在 `let resolvedPromise = Promise.resolve()` 后并未做处理，此时 `val === undefined`，接下来会进入 `resolveGeneralValue(val)`，就会走 `.then(() => {
  console.log('resolvePromise resolved')
})`

**从源码实现上来看：**`resolve(resolvedPromise)` 会消耗两个 then 时序后在执行 `.then(() => {
  console.log('resolvePromise resolved')
})`

## Promise 外面改变 Promise 的状态

**问：** 如果 Promise 的 resolve, reject 没有执行会怎么样？

**答：** Promise 会永远处于 pending 状态。

**问：** 在 Promise 的外部执行 resolve, reject 可以改变 Promise 的状态吗？

**答：** 可以，其行为如下

```js
let wait
const f = async function () {
  console.log(`----->`)
  await new Promise(resolve => {
    wait = resolve
  })
  console.log(`<-----`) // 2000 ms 后执行
}

f()

setTimeout(() => {
  wait()
}, 2000)

// axios 的取消功能就是这么做的
```

**面试题：**

```js
/**
 * 题目：JS 实现异步调度器
 * 要求：
 *  JS 实现一个带并发限制的异步调度器 Scheduler，保证同时运行的任务最多有 2 个
 *  完善下面代码中的 Scheduler 类，使程序能正确输出
 */

//  当前执行并发大于 2 时，生成一个暂停的 Promise，把 resolve 添到一个数组中，下面的代码被暂停执行
//  当前执行并发不大于 2,立即执行异步操作并从数组中弹出最先 push 的 resolve 改变 Promise 的状态，
//  由于 Promise 被解决，最初被暂停的代码可以继续执行

class Scheduler {
  constructor(maxNum) {
    this.taskList = []
    this.count = 0
    this.maxNum = maxNum // 最大并发数
  }

  async add(promiseCreator) {
    // 如果当前并发等于最大并发，那就进入任务队列等待
    if (this.count === this.maxNum) {
      await new Promise(resolve => {
        this.taskList.push(resolve) // 锁
      })
    }

    // 次数 + 1（如果前面的没执行完，那就一直添加）
    this.count++

    // 等待里面内容执行完毕
    // 阻塞执行
    const result = await promiseCreator()

    // 次数 - 1
    this.count--

    if (this.taskList.length > 0) {
      this.taskList.shift()() // 解锁
    }

    // 链式调用，将结果值返回出去
    return result
  }
}

const timeout = time => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const scheduler = new Scheduler(2)
const addTask = (time, order) => {
  return scheduler.add(() => timeout(time)).then(() => console.log(order))
}

addTask(1000, '1')
addTask(500, '2')
addTask(300, '3')
addTask(400, '4')

// 输出：2 3 1 4
// 一开始，1、2 两个任务进入队列
// 500ms 时，完成 2，输出 2，任务 3 进队
// 800ms 时，完成 3，输出 3，任务 4 进队
// 1000ms 时，完成 1，输出 1，没有下一个进队的
// 1200ms 时，完成 4，输出 4，没有下一个进队的
// 进队完成，输出 2 3 1 4
```

**分析：**

addTask 依次执行，会依次生成 4 个 add 函数调用栈

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220604-nm9.png)

## 如何停掉 Promise 链

**需求：**

在使用 Promise 处理一些复杂逻辑的过程中，我们有时候会想要在发生某种错误后就停止执行 Promise 链后面所有的代码。

**方案：**

直接返回一个始终不 resolve 也不 reject 的 Promise，即这个 Promise 永远处于 pending 状态，那么后面的 Promise 链当然也就一直不会执行了，因为会一直等着。

## 参考资料

- [100 行代码实现 Promises/A+ 规范](https://zhuanlan.zhihu.com/p/83965949)
- [如何确定 JS 中链式调用 Promise.then() 的执行顺序问题？](https://www.zhihu.com/question/323269739/answer/675546467)
- [求前端大佬解析这道 Promise 题，为啥 resolved 是在 promise2 之后输出?](https://www.zhihu.com/question/430549238)
- [Promise 外面改变 Promise 的状态](https://juejin.cn/post/6844903985674108942)
- [Promise 自己知道被 await 或者被 then 了吗？](https://www.zhihu.com/question/470685155/answer/1985714247)
- [一直没有 resolve 也没有 reject 的 Promise 会造成内存泄露吗？](https://www.zhihu.com/question/386595851)
- [永不 resolve / reject 的 Promise 会导致内存泄漏吗？](https://zhuanlan.zhihu.com/p/385764204)
