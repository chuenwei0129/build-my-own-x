class MySyncHook {
  constructor() {
    this.hooks = []
  }

  tap(fn) {
    this.hooks.push(fn)
  }

  call(...args) {
    this.hooks.forEach(hook => hook(...args))
  }
}

module.exports = MySyncHook
