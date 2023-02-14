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
