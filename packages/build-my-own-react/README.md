# `build-my-own-react`

> TODO: description

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

**`creact-dom.js`：**

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

**creactUnit.js：**

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

**TextUnit.js：**

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

**Unit.js：**

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

## 渲染组件流程

