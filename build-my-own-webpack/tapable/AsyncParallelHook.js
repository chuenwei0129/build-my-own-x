// const { AsyncParallelHook } = require('tapable')

// const hook = new AsyncParallelHook(['name'])

class MyAsyncParallelHook {
  hooks = []
  tapAsync = (name, hook) => {
    this.hooks.push(hook)
  }
  // 异步并行
  callAsync = (...args) => {
    const lastCallback = args.pop()
    let idx = 0
    const done = () => {
      idx++
      if (idx === this.hooks.length) {
        lastCallback()
      }
    }
    this.hooks.forEach(hook => {
      hook(...args, done)
    })
  }
  tapPromise(name, hook) {
    this.hooks.push(hook)
  }
  promise(...args) {
    return Promise.all(this.hooks.map(hook => hook(...args)))
  }
}

const hook = new MyAsyncParallelHook()

// 缺点如果某个注册多调几次cb 会出bug,原版也一样
hook.tapAsync('green', (props, next) => {
  setTimeout(() => {
    console.log('green ' + props)
    next()
    // next()
  }, 1000)
})

hook.tapAsync('red', (props, next) => {
  setTimeout(() => {
    console.log('red ' + props)
    next()
  }, 1000)
})

hook.callAsync('call', () => {
  console.log('end')
})

hook.tapPromise('first', props => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('first ' + props)
      resolve()
    }, 1000)
  })
})

hook.tapPromise('second', props => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('second ' + props)
      resolve()
    }, 1000)
  })
})

hook.promise('call').then(() => {
  console.log('end')
})
