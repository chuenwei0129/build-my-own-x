// 某个监听事件 如果返回了值 这个方法会再次执行，只有返回undefined这个方法才会停止执行
class MySyncLoopHook {
  constructor() {
    this.hooks = []
  }
  tap(name, fn) {
    this.hooks.push(fn)
  }
  call(...args) {
    this.hooks.forEach(hook => {
      let ret
      do {
        ret = hook(...args)
      } while (ret !== undefined)
    })
  }
}

const hook = new MySyncLoopHook()

let idx = 1
hook.tap('first', name => {
  console.log('first', name)
  return idx === 3 ? undefined : ++idx
})

hook.tap('second', name => {
  console.log('second', name)
})

hook.tap('third', name => {
  console.log('third', name)
})

hook.call('call')
