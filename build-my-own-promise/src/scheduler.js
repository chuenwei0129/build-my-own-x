/**
 * 题目：JS 实现异步调度器
 * 要求：
 *  JS 实现一个带并发限制的异步调度器 Scheduler，保证同时运行的任务最多有 2 个
 *  完善下面代码中的 Scheduler 类，使程序能正确输出
 */

//  当前执行并发大于 2 时，生成一个暂停的 Promise，把 resolve 添到一个数组中，下面的代码被暂停执行
//  当前执行并发不大于 2,立即执行异步操作并从数组中弹出最先 push 的 resolve 改变 Promise 的状态，
//  由于 Promise 被解决，最初被暂停的代码可以继续执行

//  如果 Promise 的 resolve, reject 没有执行会怎么样？
//  在 Promise 的外部执行 resolve, reject 可以改变 Promise 的状态吗？

// 执行步骤
// addTask 1 2 3 4 是同步的
// addTask 1
// this.count = 0 < 2
// this.count = 1
// await task1 1000ms
// addTask 2
// this.count = 1 < 2
// this.count = 2
// await task2 500ms
// addTask 3
// this.count = 2 >= 2
// this.taskQueue.push(task3)
// addTask 4
// this.count = 3 >= 2
// this.taskQueue.push(task4)

class Scheduler {
  constructor(maxNum) {
    this.taskList = []
    this.count = 0
    this.maxNum = maxNum // 最大并发数
  }

  async add(promiseCreator) {
    // 如果当前并发超过最大并发，那就进入任务队列等待
    if (this.count === this.maxNum) {
      // add 是同步的，一下子会把所有的任务都放入函数中，所以这里需要把不需要执行的任务放入队列中
      // 代码可以理解为给 task 3 和 task 4 每个任务都加了把锁，不让执行下去，停在那
      // 更多任务更多的锁，锁的调度也是串行的
      // 当 task 1 或 task 2 执行完毕 task 2，就会解除第一把锁，让 task 3 执行
      // 当 task 1 或 task 3 执行完毕 task 3，就会解除第二把锁，让 task 4 执行
      // 一共 8000 ms
      await new Promise((resolve) => {
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

const timeout = (time) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

const scheduler = new Scheduler(2)
const addTask = (time, order) => {
  return scheduler.add(() => timeout(time)).then(() => console.log(order))
}

// addTask(1000, '1')
// addTask(500, '2')
// addTask(300, '3')
// addTask(400, '4')

addTask(5000, '1')
addTask(1000, '2')
addTask(3000, '3')
addTask(4000, '4')

// 输出：2 3 1 4
// 一开始，1、2 两个任务进入队列
// 500ms 时，完成 2，输出 2，任务 3 进队
// 800ms 时，完成 3，输出 3，任务 4 进队
// 1000ms 时，完成 1，输出 1，没有下一个进队的
// 1200ms 时，完成 4，输出 4，没有下一个进队的
// 进队完成，输出 2 3 1 4
