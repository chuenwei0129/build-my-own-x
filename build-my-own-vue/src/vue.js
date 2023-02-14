const complierUtils = {
  // 获取 student.name 的值
  getValue(vm, expr) {
    return expr.split('.').reduce((data, cur) => {
      // vm.$data.student.name
      return data[cur]
    }, vm.$data)
  },

  model(node, expr, vm) {
    // 双向绑定
    const operator = this.updater.modelUpdater
    // update
    new Watcher(vm, expr, (newVal) => {
      operator(node, newVal)
    })

    // 双向绑定的实现
    node.addEventListener('input', (e) => {
      // 把 e.target.value 的值赋给 $data.xx.xx, 也就是 expr
      expr.split('.').reduce((data, cur, idx, arr) => {
        if (idx === arr.length - 1) {
          data[cur] = e.target.value
        }
        return data[cur]
      }, vm.$data)
    })

    const value = this.getValue(vm, expr)
    // create
    operator(node, value)
  },

  updater: {
    modelUpdater(node, value) {
      node.value = value
    },

    textUpdater(node, value) {
      node.textContent = value
    },
  },

  // 文本替换
  text(node, expr, vm) {
    const operator = this.updater.textUpdater
    // 把数据插入节点中，替换 {{}}
    const value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      // 对应 update
      // new Watcher create 时执行一次，这里类似 setTimeOut update 时直接执行 () => operator => textUpdater
      new Watcher(vm, args[1], () => {
        operator(
          node,
          expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
            return this.getValue(vm, args[1])
          })
        )
      })
      return this.getValue(vm, args[1])
    })
    // 对应 create
    operator(node, value)
  },

  // 处理事件
  on(node, expr, vm, eventName) {
    node.addEventListener(eventName, function (e) {
      // 也是为了解决 methods this 指向问题
      // this.reverseTitle()
      vm[expr].call(vm, e)
    })
  },
}

class Vue {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    this.computed = options.computed
    this.methods = options.methods

    // 数据响应式
    new Observer(this.$data)

    // 把计算属性 msg 放到 data 上
    // vm.$data.msg 等同于 vm.computed.msg()
    for (const key in this.computed) {
      Object.defineProperty(this.$data, key, {
        get: () => {
          // 不用箭头函数 this === this.$data 用箭头函数 this === vm
          // 这里 call(this) 是为了让 msg 调用时内部 this 指向 vm 而不是 vm.computed
          return this.computed[key].call(this)
        },
      })
    }

    // vue 为了用户体验，把 methods 放到 vm 上
    for (const key in this.methods) {
      Object.defineProperty(this, key, {
        get: () => {
          return this.methods[key]
        },
      })
    }

    // vue 为了用户体验，把数据放到 vm 中
    for (const key in this.$data) {
      Object.defineProperty(this, key, {
        get() {
          return this.$data[key]
        },
        set(newVal) {
          this.$data[key] = newVal
        },
      })
    }

    // 模板编译
    if (this.$el) {
      new Complier(this.$el, this)
    }
  }
}

class Complier {
  constructor(el, vm) {
    // 判断是否元素节点，对应 vue 中传 el: document.querySelector('#app')
    // 最终表示的是 <div id="app">....</div> 真实 dom
    this.el = el.nodeType === 1 ? el : document.querySelector(el)
    this.vm = vm
    // 为了性能 dom 节点转换成 fragment 操作
    // 只转换了所有子节点
    const fragment = this.node2fragment(this.el)
    // 编译，其时就是把 vue 自定义的内容如 {{}} 替换成 this.$data 中的值
    this.complierNode(fragment)
    // // 挂载 dom
    this.el.appendChild(fragment)
  }

  node2fragment(node) {
    // 创建一个文档碎片，内存中的 dom
    const fragment = document.createDocumentFragment()
    let _firstChild
    while ((_firstChild = node.firstChild)) {
      fragment.appendChild(_firstChild)
    }
    return fragment
  }

  // 编译节点
  complierNode(node) {
    ;[...node.childNodes].forEach((child) => {
      if (child.nodeType === 1) {
        // 元素节点
        this.complierElement(child)
        // 递归处理子节点
        this.complierNode(child)
      } else {
        // 文本节点
        this.complierText(child)
      }
    })
  }

  // 编译元素: 处理属性
  // 指令处理
  complierElement(node) {
    ;[...node.attributes].forEach((attr) => {
      const { name, value: expr } = attr
      if (this.isDirective(name)) {
        const [, directive] = name.split('-')
        // 事件 v-on:click="reverseTitle" eventName = click
        // v-model="student.name" eventName = undefined
        const [directiveName, eventName] = directive.split(':')
        complierUtils[directiveName](node, expr, this.vm, eventName)
      }
    })
  }

  // 编译文本: {{}}
  complierText(node) {
    const content = node.textContent
    // 找出 {{}}
    if (/\{\{(.+?)\}\}/.test(content)) {
      complierUtils.text(node, content, this.vm)
    }
  }

  // 指令判断
  isDirective(attrName) {
    return attrName.startsWith('v-')
  }
}

class Observer {
  constructor(data) {
    this.observer(data)
  }

  observer(data) {
    if (data && typeof data === 'object') {
      for (const key in data) {
        this.defineReactive(data, key, data[key])
      }
    }
  }

  defineReactive(obj, key, val) {
    if (typeof val === 'object' && val !== null) this.observer(val)
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.on(Dep.target)
        return val
      },
      set: (newVal) => {
        if (newVal !== val) {
          this.observer(newVal)
          val = newVal
          dep.emit()
        }
      },
    })
  }
}

// 事件调度中心
class Dep {
  constructor() {
    this.events = []
  }
  // 订阅 watcher
  on(watcher) {
    this.events.push(watcher)
  }
  // 触发事件
  emit() {
    this.events.forEach((watcher) => watcher.update())
  }
}

class Watcher {
  // 数据监听器
  constructor(vm, expr, cb) {
    this.vm = vm
    this.expr = expr
    this.cb = cb

    // 只能缓存初始值
    this.initVal = this.getInitVal()
  }

  getInitVal() {
    Dep.target = this
    const val = complierUtils.getValue(this.vm, this.expr)
    Dep.target = null
    return val
  }

  update() {
    const newVal = complierUtils.getValue(this.vm, this.expr)
    this.cb(newVal)
  }
}
