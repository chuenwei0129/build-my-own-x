// 写同步时可以加保险，在注册的函数里，可以决定是否向下执行。 返回非undefined的值，不会向下执行了。

class MySyncBailHook {
  constructor() {
    this.hooks = []
  }
  tap(name, fn) {
    this.hooks.push(fn)
  }
  call(...args) {
    // 计数器
    let res = null
    let idx = 0
    do {
      res = this.hooks[idx++](...args)
    } while (res === undefined && this.hooks.length > idx)
  }
}

const hook = new MySyncBailHook()

hook.tap('first', name => {
  console.log('first', name)
})

hook.tap('second', name => {
  console.log('second', name)
})

hook.tap('third', name => {
  console.log('third', name)
})

hook.call('call')
