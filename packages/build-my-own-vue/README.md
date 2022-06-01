# `build-my-own-vue`

> TODO: description

## Usage

## 前置知识：Object.defineProperty

ES5 提供了 [Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty) 方法，该方法可以在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象。

**语法：**

```js
Object.defineProperty(obj, prop, descriptor)
```

**参数：**

- **obj:** 要在其上定义属性的对象。
- **prop:** 要定义或修改的属性的名称。
- **descriptor:** 将被定义或修改的属性的描述符。

所有的属性描述符都是非必须的，但是 `descriptor` 这个字段是必须的，如果不进行任何配置，你可以这样：

```js
const obj = Object.defineProperty({}, 'num', {})
console.log(obj.num) // undefined
```

**属性描述符默认配置：**

```js
Object.defineProperty({}, 'key', {
  value: undefined,
  writable: false,
  enumerable: false,
  configurable: false,
  get: undefined,
  set: undefined
})
```

**值得注意的是：**

属性描述符必须是数据描述符或者存取描述符两种形式之一，不能同时是两者。这就意味着你可以：

```js
Object.defineProperty({}, 'num', {
  value: 1,
  writable: true,
  enumerable: true,
  configurable: true
})
```

**也可以：**

```js
let value = 1
Object.defineProperty({}, 'num', {
  get() {
    return value
  },
  set(newValue) {
    value = newValue
  },
  enumerable: true,
  configurable: true
})
```

**但是不可以：**

```js
// 报错
Object.defineProperty({}, 'num', {
  value: 1,
  get() {
    // this === {}
    // this.value 取不到 value
    return 1
  }
})
```

**响应式原理：**

```JavaScript
const data = {
  msg: 'hello vue',
  students: {
    name: '张三'
  },
  arr: [1, 2, 3]
}

const reactive = data => {
  for (let [k, v] of Object.entries(data)) {
    // 2. if (typeof v === 'object' && v !== null) reactive(v) 处理对象嵌套
    if (typeof v === 'object' && v !== null) reactive(v)
    Object.defineProperty(data, k, {
      get() {
        console.log(`属性 ${k} 被读取`)
        // 此处可以做一些对代理前的值做一些个性化处理
        // v = v + '123'
        return v
      },
      set(newVal) {
        // 3. if (typeof newV === 'object' && newV !== null) reactive(newV) 对象嵌套，监听的对象重新赋值为新的对象
        if (typeof newVal === 'object' && newVal !== null) reactive(newVal)
        console.log(`属性 ${k} 数据发生改变，原值为：${v}，新值为：${newVal}`)
        v = newVal
      }
    })
  }
  return data
}

const reactiveData = reactive(data)

// 1. 对象无嵌套
reactiveData.msg = 'hello world'

// 2. 对象嵌套
reactiveData.students.name = '李四'

// 3. 属性重新赋值为新的对象
reactiveData.students = {
  name: '王五'
}

// 读
console.log(reactiveData.students.name)

// 4. 给 reactiveData 添加新的属性
// 无法监听
reactiveData.newProp = '新属性'
reactiveData.newProp = '改变新属性'

// 5. 劫持数组方法
const arrMethods = ['push', 'shift', 'unshift']
// 函数劫持，批量重写数组常用方法
arrMethods.forEach(method => {
  // 保存原方法
  const oldMethod = Array.prototype[method]
  // 重写原型方法
  Array.prototype[method] = function (...args) {
    console.log(`数组 ${method} 方法被调用`)
    oldMethod.call(this, ...args)
  }
})

// 数组 push 方法被调用
reactiveData.arr.push(4)

// 对数组其它特性有点奇怪
// 监听定义部份，表现如对象
// 属性 2 数据发生改变，原值为：3，新值为：2
reactiveData.arr[2] = 2
// 没监听到
reactiveData.arr.length = 5
// 没监听到
reactiveData.arr[4] = 2
```

## 前置知识：发布订阅

```js
// 发布订阅模式
// 支持先发布后订阅

class EventEmitter {
  constructor() {
    this.eventPools = []
    this.caches = {}
  }

  on(eventName, eventFn) {
    if (eventName in this.caches) {
      eventFn(...this.caches[eventName])
    } else {
      this.eventPools.push({ [eventName]: eventFn })
    }
  }

  emit(eventName, ...args) {
    this.eventPools.forEach(event => {
      if (event[eventName]) {
        event[eventName](...args)
      } else {
        this.caches[eventName] = [...args]
      }
    })
  }

  off(eventName) {
    for (const [idx, event] of this.eventPools.entries()) {
      if (event.hasOwnProperty(eventName)) {
        this.eventPools.splice(idx, 1)
      }
    }
  }

  once(eventName, eventFn) {
    const eventFnOnce = (...args) => {
      eventFn(...args)
      this.off(eventName)
    }
    this.on(eventName, eventFnOnce)
  }
}
```
