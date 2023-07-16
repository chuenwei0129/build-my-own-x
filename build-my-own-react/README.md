# 温故知新：手写迷你 react 15

## 测试用例

**在 [`examples`](./examples/) 目录中：** 使用 [live-server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 启动 `index.html` 测试。

## 首次渲染

### 渲染组件

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220530-1lp.png)

```js
// app.js
class Counter extends React.Component {
  constructor(props) {
    super(props)
    this.state = { count: 1 }
  }

  handleClick = () => {
    alert('hello world')
  }

  componentWillMount() {
    console.log('componentWillMount')
  }

  componentDidMount() {
    console.log('componentDidMount')
  }

  render() {
    const h1 = React.createElement(
      'h1',
      { style: { color: 'yellow' } },
      this.props.name
    )

    const counter = React.createElement(
      'div',
      { style: { color: 'red' } },
      this.state.count
    )

    const btn = React.createElement(
      'button',
      { onClick: this.handleClick },
      ' + '
    )

    return React.createElement(
      'div',
      { style: { backgroundColor: 'grey' } },
      h1,
      counter,
      btn
    )
  }
}

class CounterBox extends React.Component {
  constructor(props) {
    super(props)
    this.state = { name: '计数器' }
  }

  render() {
    return React.createElement(Counter, { name: this.state.name })
  }
}

ReactDOM.render(
  React.createElement(CounterBox),
  document.getElementById('root')
)
```

### 最终渲染的 DOM 结构

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220531-49n.png)

## 更新流程

### 测试组件

```js
// app.js
import ReactDOM from '../src/react-dom.js'
import React from '../src/react.js'

class Counter extends React.Component {
  constructor(props) {
    super(props)

    this.state = { flag: true }
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ flag: !this.state.flag })
    }, 2000)
  }

  render() {
    const list1 = React.createElement(
      'ul',
      null,
      React.createElement('li', { key: 'A', style: { color: 'yellow' } }, 'A'),
      React.createElement('li', { key: 'B' }, 'B'),
      React.createElement('li', { key: 'C' }, 'C'),
      React.createElement('li', { key: 'D' }, 'D')
    )

    const list2 = React.createElement(
      'ul',
      null,
      React.createElement('li', { key: 'A', style: { color: 'blue' } }, 'A1'),
      React.createElement('li', { key: 'C' }, 'C1'),
      React.createElement('li', { key: 'B' }, 'B'),
      React.createElement('li', { key: 'E' }, 'E1'),
      React.createElement('li', { key: 'F' }, 'F1')
    )

    return this.state.flag ? list1 : list2
  }
}

ReactDOM.render(React.createElement(Counter), document.getElementById('root'))
```

### 流程分析

首次渲染完成后，触发 `componentDidMount` 钩子函数注册的 setInterval 触发器，2000ms 后执行 `this.setState({ flag: !this.state.flag })`

此时会进入 [ComponentFragment.js](./src/ComponentFragment.js) 中执行如下代码：

```js
this._instanceComponent.state = { ...this._instanceComponent.state, ...nextState }
// ...
this._nextRenderReturnedReactElement = this._instanceComponent.render()
```

这里 `this._nextRenderReturnedReactElement` 就是 **list2**

**进入组件 diff 阶段：**

```js
// 组件级 diff
if (
  shouldDeepCompare(
    // 老的 jsx
    this._renderReturnedFragmentInstance._currentReactElement,
    // 新的 jsx
    this._nextRenderReturnedReactElement
  )
) {
  // 组件根 type 相同，往下递归找到不同的节点，进行更新
  this._renderReturnedFragmentInstance.update(
    this._nextRenderReturnedReactElement
  )
} else {
  // 组件根 type 不同，直接替换
  document.querySelector(`[data-react_id="${this._react_id}"]`).outerHTML =
    createFragmentInstance(this._nextRenderReturnedReactElement).create(
      this._react_id
    )

  // 更新缓存的 jsx
  this._renderReturnedFragmentInstance._currentReactElement =
    this._nextRenderReturnedReactElement
}
```

**list1** 与 **list2** 的根节点都是 `'ul'`，会进入 `this._renderReturnedFragmentInstance.update(this._nextRenderReturnedReactElement)` 逻辑。

之后代码进入 [ElementFragment.js](./src/ElementFragment.js)

**进入 dom diff 阶段：**

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220531-49e.png)

**要点：**

1. 通过 `key` 找到旧节点集合中的节点，如果找到了，就说明该节点可复用，否则就是新节点，需要创建
2. 通过 `key` 找到旧节点集合中的节点，比较该节点的 type 是否与新节点的 type 相同，如果相同，就说明该节点可复用，否则就是新节点，需要创建
3. 可复用的节点，需要判断是否需要移动
4. 不可复用的节点，需要删除
5. 循环旧节点集合发现存在新节点集合中不存在的节点，需要删除

**按图例解释算法：**

1. 循环新节点集合，遍历到 A 通过 key 找到旧节点集合中 A，比较发现 A 可复用，并且 A 的 `_mountedIndex === lastIndex === 0`，所以 A 原地复用，更新 `lastIndex = Math.max(0, 0) = 0`，更新 `_mountedIndex` 为当前索引 0。
2. 遍历到 C，C 也可复用，但其 `_mountedIndex === 2 > lastIndex === 0`，所以 C 原地复用，更新 `lastIndex = Math.max(2, 0) = 2`，更新 `_mountedIndex` 为当前索引 1。
3. 遍历到 B，B 也可复用，但其 `_mountedIndex === 1 < lastIndex === 2`，所以 B 需要移动，更新 `lastIndex = Math.max(2, 1) = 2`，更新 `_mountedIndex` 为当前索引 2。移动规制为从原来的索引 1 处移到索引 2 处。
4. 遍历到 E，F，由于无法复用，所以执行插入逻辑，插入位置是当前索引 3，4，更新 `_mountedIndex` 为 3，4。循环旧节点集合，发现节点 D 不在新节点集合中，执行删除逻辑。

**具体代码：**

```js
diffChildren(nextReactElements) {
  // 生成旧的 fragment 实例 与 props.key 的映射
  const genPrevFragmentInstancesMap = (fragmentInstances) => {
    const map = {}
    fragmentInstances.forEach((fragmentInstance, idx) => {
      map[fragmentInstance._currentReactElement.props?.key ?? `${idx}`] =
        fragmentInstance
    })
    return map
  }

  const prevFragmentInstancesMap = genPrevFragmentInstancesMap(
    this._fragmentInstances
  )

  const getNextFragmentInstances = (
    prevFragmentInstancesMap,
    nextReactElements
  ) => {
    const nextFragmentInstances = []
    const nextFragmentInstancesMap = {}

    nextReactElements.forEach((nextReactElement, idx) => {
      // 获取 key
      const nextKey = nextReactElement.props?.key ?? `${idx}`
      // 把数组序列 id 当作的 key，fragmentInstance 与 key 的绑定会变化，不是一一对应，会导致无法使用 map 复用
      const prevFragmentInstance = prevFragmentInstancesMap[nextKey]
      const prevReactElement = prevFragmentInstance?._currentReactElement
      // 由 key 和 type 共同决定节点是否可以复用，虽然节点可以复用，但可能需要移动，所以仍然需要 push 进 nextFragmentInstances 做进一步处理
      if (shouldDeepCompare(prevReactElement, nextReactElement)) {
        prevFragmentInstance.update(nextReactElement)
        nextFragmentInstances.push(prevFragmentInstance)
        nextFragmentInstancesMap[nextKey] = prevFragmentInstance
      } else {
        // 例子中，key e，key f 会因为 prevFragmentInstancesMap[nextKey] === undefined 而进入这里
        // key a 如果 type 先为 li 后为 span，type 不同也会进入这里
        // 他们都会加入 nextFragmentInstances 做进一步处理
        const nextFragmentInstance = createFragmentInstance(nextReactElement)
        nextFragmentInstances.push(nextFragmentInstance)
        nextFragmentInstancesMap[nextKey] = nextFragmentInstance
        // 旧节点无法复用，只能添加新节点，所以 this._fragmentInstances 的长度会变为 7
        // 因为 genPrevFragmentInstancesMap 在 getNextFragmentInstances 之前执行，所以也无需担心更新会影响到旧节点
        this._fragmentInstances.push(nextFragmentInstance)
      }
    })

    return { nextFragmentInstances, nextFragmentInstancesMap }
  }

  const { nextFragmentInstances, nextFragmentInstancesMap } =
    getNextFragmentInstances(prevFragmentInstancesMap, nextReactElements)

  // 开始处理
  let lastIndex = 0
  nextFragmentInstances.forEach((nextFragmentInstance, idx) => {
    const nextKey =
      nextFragmentInstance._currentReactElement?.props?.key ?? `${idx}`
    const prevFragmentInstance = prevFragmentInstancesMap[nextKey]
    if (nextFragmentInstance === prevFragmentInstance) {
      // 可复用情况分析
      if (prevFragmentInstance._mountedIndex < lastIndex) {
        // 是否需要移动
        patchList.push({
          parentId: this._react_id,
          parentNode: document.querySelector(
            `[data-react_id="${this._react_id}"]`
          ),
          type: effects.MOVE,
          fromIndex: prevFragmentInstance._mountedIndex,
          toIndex: idx,
        })
      }
      lastIndex = Math.max(lastIndex, prevFragmentInstance._mountedIndex)
    } else {
      // 不可复用情况分析
      // nextFragmentInstances 存在 key 相等但不是复用的节点，需要删除
      if (prevFragmentInstance) {
        patchList.push({
          parentId: this._react_id,
          parentNode: document.querySelector(
            `[data-react_id="${this._react_id}"]`
          ),
          type: effects.REMOVE,
          fromIndex: prevFragmentInstance._mountedIndex,
        })
        // 删除节点需要解绑事件，也需要在 _fragmentInstances，过滤掉这个节点
        this._fragmentInstances = this._fragmentInstances.filter(
          (item) => item !== prevFragmentInstance
        )
      }
      // 插入新节点
      patchList.push({
        parentId: this._react_id,
        parentNode: document.querySelector(
          `[data-react_id="${this._react_id}"]`
        ),
        type: effects.INSERT,
        toIndex: idx,
        insertDOMString: nextFragmentInstance.create(
          `${this._react_id}_${idx}`
        ),
      })
    }
    // 缓存已经更新的 _mountedIndex，等待更新做为下次更新的上一次的索引
    nextFragmentInstance._mountedIndex = idx
  })

  // 旧节点中存在，新节点中不存在的要删除
  Object.keys(prevFragmentInstancesMap).forEach((key) => {
    if (!(key in nextFragmentInstancesMap)) {
      patchList.push({
        parentId: this._react_id,
        parentNode: document.querySelector(
          `[data-react_id="${this._react_id}"]`
        ),
        type: effects.REMOVE,
        fromIndex: prevFragmentInstancesMap[key]._mountedIndex,
      })
      // 删除后需要更新 _fragmentInstances
      this._fragmentInstances = this._fragmentInstances.filter(
        (item) => item !== prevFragmentInstancesMap[key]
      )
    }
  })
}
```

**最后得到 patchList 为如下：**

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220531-4y6.png)
