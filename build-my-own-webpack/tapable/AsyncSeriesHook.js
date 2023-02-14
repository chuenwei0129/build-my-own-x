/* eslint-disable no-mixed-spaces-and-tabs */
// const { AsyncSeriesHook } = require('tapable')

// const task = new AsyncSeriesHook(['num'])

class MyAsyncSeriesHook {
  tasks = []
  tapAsync = (name, task) => {
    this.tasks.push(task)
  }
  callAsync = (...args) => {
    const finalCallback = args.pop()
    let idx = 0
    const next = () => {
      if (this.tasks.length === idx) return finalCallback()
      this.tasks[idx++](...args, next)
    }
    next()
  }
  tapPromise = (name, task) => {
    this.tasks.push(task)
  }
  promise = (...args) => {
    const [first, ...restTasks] = this.tasks
    return restTasks.reduce((pre, cur, idx) => {
      return pre.then(() => cur(...args))
    }, first(...args))
  }
}

const task = new MyAsyncSeriesHook()

// task.tapAsync('first', (props, next) => {
// 	setTimeout(() => {
// 		console.log('first ' + props)
// 		next()
// 	}, 2000)
// })

// task.tapAsync('second', (props, next) => {
// 	setTimeout(() => {
// 		console.log('second ' + props)
// 		next()
// 	}, 1000)
// })

// task.callAsync('call', () => {
// 	console.log('end')
// })

task.tapPromise('first', props => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('first ' + props)
      resolve()
    }, 2000)
  })
})

task.tapPromise('second', props => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('second ' + props)
      resolve()
    }, 1000)
  })
})

task.promise('call').then(() => {
  console.log('end')
})
