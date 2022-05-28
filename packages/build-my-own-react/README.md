# `build-my-own-react`

## Usage

**在 `my-react-demo` 目录中：** 使用 [live-server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 启动服务测试。

```html
<!-- index.html -->
<body>
  <div id="root"></div>
  <!-- 使用 live-server 插件 type="module" 不支持 file:// -->
  <script src="./index.js" type="module"></script>
</body>
```

## 渲染文本 `'hello world'` 流程

### my-react-demo/index.js

```js
// index.js
// .js 后缀必须添加否则会 404
import ReactDOM from '../../packages/build-my-own-react/lib/creact-dom.js'

// 分析：
// jsx 编译为 React.createElement()
// render 接受 React.createElement() 为参数，参数可以是：文本、DOM 元素、组件
// 组件是返回文本或者 DOM 元素的函数

ReactDOM.render('hello world', document.getElementById('root'))
```

### build-my-own-react/lib

**`creact-dom.js`:**

```js
// creact-dom.js
import { createReactUnit } from './creactUnit.js'

const root_react_id = '0'

function render(reactElement, container) {
  // 创建对应的 react 单元（三种）
  const reactUnit = createReactUnit(reactElement)

  // 调用对应的 react 单元的 create 方法生成对应的 dom 字串，并添加 react_id 标记
  // 形如：`<span data-react_id="0">${element}</span>`
  const reactDomString = reactUnit.create(root_react_id)

  // 挂载、这里用 innerHTML 模拟
  container.innerHTML = reactDomString

}

export default { render }
```

**creactUnit.js:**

```js
// creactUnit.js
import { TextUnit } from './TextUnit.js'

// 工厂模式
export function createReactUnit(reactElement) {
  // 对应：ReactDOM.render('hello world', document.getElementById('root'))
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return new TextUnit(reactElement)
  }
}
```

**TextUnit.js:**

```js
// TextUnit.js
import { Unit } from './Unit.js'

export class TextUnit extends Unit {
  // 创建 dom 节点字串
  create(react_id) {
    // 缓存 react_id 到实例单元上，由于递归基本上 id 可以一一对应节点
    this._react_id = react_id
    return `<span data-react_id=${this._react_id}>${this._currentReactElement}</span>`
  }
}
```

**Unit.js:**

```js
// Unit.js
// 抽象类
// 每个 react 单元都会缓存当前渲染时传入的 reactElement 本身，用于更新 diff
export class Unit {
  constructor(reactElement) {
    this._currentReactElement = reactElement
  }
  // 每个子类必须实现 create 方法
  create() {
    throw Error('创建渲染的 dom 节点字符串')
  }
}
```

## 渲染 DOM 元素流程

### 渲染页面如下

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220528-nqw.png)

### my-react-demo/index.js

```js
import ReactDOM from '../../packages/build-my-own-react/lib/creact-dom.js'
import React from '../../packages/build-my-own-react/lib/creact.js'

// 分析：
// jsx 编译为 React.createElement()
// render 接受 React.createElement() 为参数，参数可以是：文本、DOM 元素、组件
// 组件是返回文本或者 DOM 元素的函数

// DOM 元素
const DomElement = React.createElement(
  'div',
  {
    className: 'class_test',
    id: 'test',
    onClick: () => alert('hello world'),
    style: {
      backgroundColor: '#ccc',
      color: 'red'
    }
  },
  React.createElement('b', null, 'JavaScript'),
  ' is turning 25!'
)

ReactDOM.render(DomElement, document.getElementById('root'))
```

### build-my-own-react/lib

**`creact.js`:**

```js
import { createReactElement as createElement } from './creactElement.js'

export default {
  createElement
}
```

**`creactElement.js`:**

```js
// React 元素
// 是 html 的抽象 js 对象，声明式的
class ReactElement {
  constructor(type, props) {
    this.type = type
    this.props = props
  }
}

// 用户调用时执行生成 React 元素
function createReactElement(type, props, ...childReactElements) {
  // 递归生成 React 元素
  // childReactElements 里是子 createReactElement 函数的返回结果
  // props 传 null 时，为 {}
  props = props ?? {}
  props.children = childReactElements ?? []
  return new ReactElement(type, props)
}

export { ReactElement, createReactElement }
```

**`creactUnit.js`:**

```js
import { ReactElement } from './creactElement.js'
import { DomElementUnit } from './DomElementUnit.js'
import { TextUnit } from './TextUnit.js'

// 工厂模式
export function createReactUnit(reactElement) {
  // console.log('render 输入的 react 元素: ', reactElement)

  // 判断 reactElement 的类型
  // 对应：ReactDOM.render('hello world', document.getElementById('root'))
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return new TextUnit(reactElement)
  }

  // 对应：React.createElement('div', {}, 'hello world')
  if (reactElement instanceof ReactElement && typeof reactElement.type === 'string') {
    return new DomElementUnit(reactElement)
  }
```

**`DomElementUnit.js`:**

```js
import { createReactUnit } from './creactUnit.js'
import { Unit } from './Unit.js'

export class DomElementUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    const { type, props } = this._currentReactElement

    // 子 dom 字串
    let allChildDomString = ''
    let tagStart = `<${type} data-react_id="${react_id}"`
    const tagEnd = `</${type}>`
    // 处理属性
    for (const [key, val] of Object.entries(props)) {
      if (key === 'className') {
        // className 的处理
        tagStart = tagStart + `class="${val}"`
      } else if (key === 'style') {
        // style 的处理：驼峰转 '-'
        const style = Object.entries(val)
          .map(([k, v]) => {
            return `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${v}`
          })
          .join(';')
        tagStart = tagStart + `style="${style}"`
      } else if (/^on[A-Z]/.test(key)) {
        // 事件处理
        const eventName = key.slice(2).toLowerCase()
        // 事件挂在 document 上，也可挂在别处
        // document.addEventListener(eventName, val)
        // 因为此时生成的 react 元素还未挂载到 root 节点，所以需要异步处理
        setTimeout(() => {
          document.querySelector(`${type}`).addEventListener(eventName, val)
        })
      } else if (key === 'children') {
        val.forEach((el, idx) => {
          // 调用 create 方法生成对应的 dom 字串
          // 子元素可以是文本节点或者 DOM 元素
          // 平级的迭代，子元素递归
          const childReactUnit = createReactUnit(el)
          const childReactDomString = childReactUnit.create(`${react_id}_${idx}`)
          allChildDomString += childReactDomString
        })
      } else {
        // 其它不需要特殊处理的属性
        tagStart = tagStart + `${key}="${val}"`
      }
    }
    return tagStart + '>' + allChildDomString + tagEnd
  }
}
```

## 渲染组件流程

### 渲染页面

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220528-pgs.png)

### my-react-demo/index.js

```js
// js 后缀需要添加否则会 404
import ReactDOM from '../../packages/build-my-own-react/lib/creact-dom.js'
import React from '../../packages/build-my-own-react/lib/creact.js'

// 组件
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 1 }
  }

  handleClick = () => {
    alert('hello world')
  }

  componentWillMount() {
    console.log('componentWillMount run')
  }

  componentDidMount() {
    console.log('componentDidMount run')
  }

  render() {
    console.log('render run')

    const h1 = React.createElement('h1', { style: { color: 'yellow' } }, this.props.name)

    const counter = React.createElement(
      'p',
      { style: { color: (this.state.count & 1) === 0 ? 'red' : 'blue' } },
      this.state.count
    )
    const btn = React.createElement('button', { onClick: this.handleClick }, ' + ')

    // 根 div 元素的 react_id 为 '0'
    return React.createElement(
      'div',
      { style: { backgroundColor: (this.state.count & 1) === 0 ? 'green' : 'grey' } },
      h1,
      counter,
      btn
    )
  }
}

ReactDOM.render(React.createElement(Counter, { name: '计数器' }), document.getElementById('root'))
```

### build-my-own-react/lib

**`creact.js`:**

```js
import { createReactElement as createElement } from './creactElement.js'

// 用户调用的所有 react 组件基类
export class Component {
  constructor(props) {
    this.props = props
  }
  setState(nextState) {
    this._currentReactUnit.update(null, nextState)
  }
}

export default {
  Component,
  createElement
}

```

**`creact-dom.js`:**

```js
import { createReactUnit } from './creactUnit.js'

const root_react_id = '0'

// 注册自定义 mounted 事件
const event = new Event('mounted')

function render(reactElement, container) {
  // 创建对应的 react 单元（三种）
  const reactUnit = createReactUnit(reactElement)

  // 调用对应的 react 单元的 create 方法生成对应的 dom 字串，并添加 react_id 标记
  // 形如：`<span data-react_id="0">${element}</span>`
  const reactDomString = reactUnit.create(root_react_id)

  // 挂载、这里用 innerHTML 模拟
  container.innerHTML = reactDomString

  // 挂载 dom 完毕触发 mounted 事件
  document.dispatchEvent(event)
}

export default { render }
```

**`creactUnit.js`:**

```js
import { ComponentUnit } from './ComponentUnit.js'
import { ReactElement } from './creactElement.js'
import { DomElementUnit } from './DomElementUnit.js'
import { TextUnit } from './TextUnit.js'

// 工厂模式
export function createReactUnit(reactElement) {
  // console.log('render 输入的 react 元素: ', reactElement)

  // 判断 reactElement 的类型
  // 对应：ReactDOM.render('hello world', document.getElementById('root'))
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return new TextUnit(reactElement)
  }

  // 对应：React.createElement('div', {}, 'hello world')
  if (reactElement instanceof ReactElement && typeof reactElement.type === 'string') {
    return new DomElementUnit(reactElement)
  }

  // 对应：React.createElement(Counter, {}) type 为组件
  if (reactElement instanceof ReactElement && typeof reactElement.type === 'function') {
    return new ComponentUnit(reactElement)
  }
}
```

**`ComponentUnit.js`:**

```js
import { createReactUnit } from './creactUnit.js'
import { Unit } from './Unit.js'

export class ComponentUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    const { type: Component, props } = this._currentReactElement

    // 实例化用户定义的 React.Component，注入写在其标签上的 props，并把组件实例挂到 unit 实例上
    this._instanceComponent = new Component(props)

    // 把 _instanceComponent 组件和 当前 react 渲染组件单元 _currentUnit 建立联系
    this._instanceComponent._currentUnit = this

    // 调用实例的 componentWillMount 方法
    this._instanceComponent.componentWillMount && this._instanceComponent.componentWillMount()

    // 在组件实例挂载完毕后触发 componentDidMount 方法
    document.addEventListener('mounted', () => {
      this._instanceComponent.componentDidMount && this._instanceComponent.componentDidMount()
    })

    // 调用实例的 render 方法，返回的是 jsx 也就是 reactElement
    const renderReturnReactElement = this._instanceComponent.render()

    // 有了 reactElement 就可以创建对应的 react 单元（三种）组件，文本节点，dom 节点
    this._renderReturnReactUnit = createReactUnit(renderReturnReactElement)
    return this._renderReturnReactUnit.create(react_id)
  }
}
```

## 更新流程

### 文本节点更新

```js
import ReactDOM from '../../packages/build-my-own-react/lib/creact-dom.js'
import React from '../../packages/build-my-own-react/lib/creact.js'

class Counter extends React.Component {
  constructor(props) {
    super(props)

    this.state = { count: 1 }
  }

  componentWillUpdate() {
    console.log('componentWillUpdate run')
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ count: this.state.count + 1 })
    }, 1000)
  }

  render() {
    return this.state.count
  }
}

ReactDOM.render(React.createElement(Counter, { name: '计数器' }), document.getElementById('root'))
```

```js
import { Unit } from './Unit.js'

export class TextUnit extends Unit {
  // 创建 dom 节点字串
  create(react_id) {
    // 缓存 react_id 到实例单元上，由于递归，细粒度可以到文本节点 id 一一对应
    this._react_id = react_id
    return `<span data-react_id=${this._react_id}>${this._currentReactElement}</span>`
  }

  update(nextReactElement) {
    document.querySelector(`[data-react_id="${this._react_id}"]`).textContent = nextReactElement
  }
}
```

```js
import { ReactElement } from './creactElement.js'
import { createReactUnit } from './creactUnit.js'
import { Unit } from './Unit.js'

// diff 优化，是否是脏组件，即 type 不同的组件直接替换
function shouldDeepCompare(oldElement, newElement) {
  if (oldElement != null || newElement != null) {
    if (
      (typeof oldElement === 'string' || typeof oldElement === 'number') &&
      (typeof newElement === 'string' || typeof newElement === 'number')
    ) {
      return true
    } else if (oldElement instanceof ReactElement && newElement instanceof ReactElement) {
      return oldElement.type === newElement.type
    }
  }
}

export class ComponentUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    const { type: Component, props } = this._currentReactElement

    // 实例化用户定义的 React.Component，注入写在其标签上的 props，并把组件实例挂到 unit 实例上
    this._instanceComponent = new Component(props)

    // 把 _instanceComponent 组件和 当前 react 渲染组件单元 _currentUnit 建立联系
    this._instanceComponent._currentReactUnit = this

    // 调用实例的 componentWillMount 方法
    this._instanceComponent.componentWillMount && this._instanceComponent.componentWillMount()

    // 在组件实例挂载完毕后触发 componentDidMount 方法
    document.addEventListener('mounted', () => {
      this._instanceComponent.componentDidMount && this._instanceComponent.componentDidMount()
    })

    // 调用实例的 render 方法，返回的是 jsx 也就是 reactElement
    const renderReturnReactElement = this._instanceComponent.render()

    // 有了 reactElement 就可以创建对应的 react 单元（三种）组件，文本节点，dom 节点
    this._renderReturnReactUnit = createReactUnit(renderReturnReactElement)
    return this._renderReturnReactUnit.create(react_id)
  }

  update(nextReactElement, nextState) {
    // nextReactElement：需要更新的 reactElement
    // 是否更新 reactElement 上的 props 属性
    // 旧的
    const prevProps = this._currentReactElement?.props
    // 新的
    let nextProps = nextReactElement?.props
    nextProps = nextProps ?? prevProps

    // state 在创建时是用户传入的，更新时是用户调用 setState 方法时传入的
    // 更新状态
    this._instanceComponent.state = { ...this._instanceComponent.state, ...nextState }

    // componentWillUpdate 钩子
    this._instanceComponent.componentWillUpdate && this._instanceComponent.componentWillUpdate()

    // 获取状态改变后的 react 元素
    this._nextRenderReturnReactElement = this._instanceComponent.render()

    // 新老 react 元素对比
    if (
      shouldDeepCompare(
        // 缓存的老的状态
        this._renderReturnReactUnit._currentReactElement,
        // 新的状态
        this._nextRenderReturnReactElement
      )
    ) {
      // type 相同，对应节点单元传入新的状态
      // 递归执行，最终递归到文本单元
      this._renderReturnReactUnit.update(this._nextRenderReturnReactElement)
    }

    // componentDidUpdate 钩子
    this._instanceComponent.componentDidUpdate && this._instanceComponent.componentDidUpdate()
  }
}
```

### 复杂计数器
