// 瀑布的意思就是上一个监听函数的结果是下一个人的输入

class MySyncWaterFallHook {
  constructor() {
    this.hooks = []
  }
  tap(name, fn) {
    this.hooks.push(fn)
  }
  call(...args) {
    const [first, ...restHooks] = this.hooks
    const ret = first(...args)
    restHooks.reduce((prev, current, idx) => {
      // prev 上一次 reduce 的返回值
      return current(prev)
    }, ret)
  }
}

const hook = new MySyncWaterFallHook()

hook.tap('first', name => {
  console.log('first', name)
  return 'first val'
})

hook.tap('second', name => {
  console.log('second', name)
  return 'second val'
})

hook.tap('third', name => {
  console.log('third', name)
  return 'third val'
})

hook.call('call')
