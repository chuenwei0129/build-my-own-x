const complierUtils = {
  // 获取 student.name 的值
  getValue(vm, expr) {
    return expr.split('.').reduce((data, cur) => {
      // vm.$data.student.name
      return data[cur]
    }, vm.$data)
  },

  model(node, expr, vm) {
    // TODO: 双向绑定
  },

  updater: {
    // modelUpdater(node, value) {
    //   node.value = value
    // },

    textUpdater(node, value) {
      node.textContent = value
    }
  },

  // 文本替换
  text(node, expr, vm) {
    const operator = this.updater.textUpdater
    // 把数据插入节点中，替换 {{}}
    const value = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
      return this.getValue(vm, args[1])
    })
    operator(node, value)
  },

  // 处理事件
  on(node, expr, vm, eventName) {
    node.addEventListener(eventName, function (e) {
      // 也是为了解决 methods this 指向问题
      // this.reverseTitle()
      vm[expr].call(vm, e)
    })
  }
}

class Vue {
  constructor(options) {
    this.$el = options.el
    this.$data = options.data
    this.computed = options.computed
    this.methods = options.methods

    // 把计算属性 msg 放到 data 上
    // vm.$data.msg 等同于 vm.computed.msg()
    for (const key in this.computed) {
      Object.defineProperty(this.$data, key, {
        get: () => {
          // 不用箭头函数 this === this.$data 用箭头函数 this === vm
          // 这里 call(this) 是为了让 msg 调用时内部 this 指向 vm 而不是 vm.computed
          return this.computed[key].call(this)
        }
      })
    }

    // vue 为了用户体验，把 methods 放到 vm 上
    for (const key in this.methods) {
      Object.defineProperty(this, key, {
        get: () => {
          return this.methods[key]
        }
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
        }
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
    ;[...node.childNodes].forEach(child => {
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
    ;[...node.attributes].forEach(attr => {
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
