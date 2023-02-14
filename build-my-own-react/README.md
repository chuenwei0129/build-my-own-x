# 温故知新：手写迷你 react 15

## 测试用例

**在 [`examples`](./examples/) 目录中：** 使用 [live-server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 启动 `index.html` 测试。

## 首次渲染

### 渲染文本节点

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220529-x3o.png)

**代码 `commit` ：**[c39fb6c5a4b92a83e647c7fa6072ffad178a06f4](https://github.com/chuenwei0129/build-my-own-x/commit/c39fb6c5a4b92a83e647c7fa6072ffad178a06f4)

### 渲染 DOM 元素

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220530-q0.png)

**代码 `commit` ：**[9c8857145d16c491d9f50c23ee07aa7058c5856e](https://github.com/chuenwei0129/build-my-own-x/commit/9c8857145d16c491d9f50c23ee07aa7058c5856e)

### 复合渲染：组件渲染

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220530-1lp.png)

**代码 `commit` ：**[4475870677e3c2ab572a178a2a391a4ad9bc81aa](https://github.com/chuenwei0129/build-my-own-x/commit/4475870677e3c2ab572a178a2a391a4ad9bc81aa)

### 渲染环节的生命周期钩子

**代码 `commit` ：**[0661543956504e89d24c0c5903028880caa9511b](https://github.com/chuenwei0129/build-my-own-x/commit/0661543956504e89d24c0c5903028880caa9511b)

### 最终渲染的 DOM 结构

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220531-49n.png)

## 更新流程

### 测试组件

```js
import ReactDOM from '../src/creact-dom.js'
import React from '../src/creact.js'

class Counter extends React.Component {
  constructor(props) {
    super(props)

    this.state = { flag: true }
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ flag: !this.state.flag })
    }, 1000)
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

首次渲染完成后，执行 `componentDidMount` 钩子函数注册 setTimeout 触发器，1000ms 后执行 `this.setState({ flag: !this.state.flag })`

由于 `class Counter extends React.Component` 相当于执行 **creact.js** 目录下 `this._currentReactUnit.update(null, nextState)`

`this._currentReactUnit` 这里可看做 **Counter** 组件，等同于调用 `ComponentUnit.update(null, false)`

代码进入 **ComponentUnit.js** 中会执行如下代码：

```js
// 更新状态
this._instanceComponent.state = { ...this._instanceComponent.state, ...nextState }

// 获取更新状态后的 jsx 元素
this._nextRenderReturnReactElement = this._instanceComponent.render()
```

这里 `this._nextRenderReturnReactElement` 等同于 **list2**

**进入组件 diff 阶段：**

```js
if (
  shouldDeepCompare(
    // 老的 jsx
    this._renderReturnReactUnit._currentReactElement,
    // 新的 jsx
    this._nextRenderReturnReactElement
  )
) {
  // 返回的 jsx 是文本的情况下 _renderReturnReactUnit 是 TextUnit
  // 返回的 jsx 是 dom 的情况下 _renderReturnReactUnit 是 DomElementUnit
  // 返回的 jsx 是 组件 的情况下 _renderReturnReactUnit 是 ComponentUnit
  // 递归处理新的 jsx
  this._renderReturnReactUnit.update(this._nextRenderReturnReactElement)
} else {
  // type 不同，整个 type 替换
  // 代码执 create 是调用的 domUnit.create，上面并没有 this._renderReturnReactUnit 逻辑
  // 所以 this._renderReturnReactUnit._currentReactElement 并没有更新
  // 所以出 bug，需要手动更新 this._renderReturnReactUnit._currentReactElement
  document.querySelector(`[data-react_id="${this._react_id}"]`).outerHTML = createReactUnit(
    this._nextRenderReturnReactElement
  ).create(this._react_id)

  // _renderReturnReactUnit 只有 componentUnit 才有
  this._renderReturnReactUnit._currentReactElement = this._nextRenderReturnReactElement
}
```

list1 与 list2 的根节点都是 `'ul'`，会进入 `this._renderReturnReactUnit.update(this._nextRenderReturnReactElement)` 逻辑，这里 `this._renderReturnReactUnit` 可看做 **ul**。

之后代码进入 **DomElementUnit.js** 执行：

```js
// 代码进入这里意味着根节点 tag 可复用，可以 dom 上更新 props 和 diff 同级 children
update(nextReactElement) {
  // create 处理得是 this._currentReactElement 对应的 jsx
  // update 处理得是 nextReactElement 对应的 jsx
  // nextReactElement 是一个对象，包含 type、props、children
  // 更新 dom 属性，就是处理 props，比如 className, style, onClick 等
  // debugger
  this.updateProps(this._currentReactElement.props, nextReactElement.props)
  // 处理完 props，再处理 children
  // 同级 diff
  this.updateChildren(nextReactElement.props.children)
}
```

`this.updateProps` 比较简单更新的是 `ul` 上的 `props`，children 由 `this.updateChildren` 单独处理

然后进入 `this.diffChildren(nextChildReactElements)` 逻辑，此时 `nextChildReactElements` 表示 5 个 `li`，触发同级 diff，进入 `this.updateReuseSelfAndGetNextChildReactUnits(prevChildReactUnitsMap, nextChildReactElements)`

```js
// 同级: 输入旧节点集和和新 jsx 输出新节点集和
// 会更新复用节点，并且新增节点和复用节点集和（可能都新增也可能都复用）
updateReuseSelfAndGetNextChildReactUnits(prevChildReactUnitsMap, nextChildReactElements) {
  const nextChildReactUnits = []
  const nextChildReactUnitsMap = {}

  // 把数组序列 id 当作的 key，reactUnit 与 key 的绑定会变化，不是一一对应，无法使用 map 查找复用
  // 这里 diff 的是 jsx，jsx diff 是同级，由 key type 共同决定
  nextChildReactElements.forEach((nextChildReactElement, idx) => {
    const nextKey = nextChildReactElement.props?.key ?? `${idx}`
    // 通过 nextChildReactElements key 拿到 key 对应的 prevChildReactUnit
    const prevChildReactUnit = prevChildReactUnitsMap[nextKey]
    const prevChildReactElement = prevChildReactUnit?._currentReactElement
    // 是否复用由 key type 共同决定
    // 通过新 key 找不打对应的旧单元，表明没有可复用单元，prevChildReactElement undefined，进入 else 逻辑
    // diff type
    if (shouldDeepCompare(prevChildReactElement, nextChildReactElement)) {
      // type 相同，复用旧 react 单元，因为确定了复用，所以要更新
      // 即使内容没变也会进入更新逻辑。比如 G 节点，可以优化（这就是 react 把优化交给了用户）
      // 这里会调用 type 对应级别的 Unit.update 更新复用节点文本和属性，然后递归更新子元素的文本和属性
      // 最后文本走的逻辑是 prevChildReactElement 与 文本 nextChildReactElement，比较不同，调用文本单元更新文本
      prevChildReactUnit.update(nextChildReactElement)
      // nextChildReactUnits 就是为接下来的操作准备的
      // 把复用的单元放入新 react 单元数组
      nextChildReactUnits.push(prevChildReactUnit)
      nextChildReactUnitsMap[nextKey] = prevChildReactUnit
    } else {
      // type 不同，无法复用，创建新的 react 单元
      const nextChildReactUnit = createReactUnit(nextChildReactElement)
      nextChildReactUnits.push(nextChildReactUnit)
      nextChildReactUnitsMap[nextKey] = nextChildReactUnit

      // 没有调用 nextChildReactUnit.create 无法更新 this._childReactUnits
      // 需要主动更新缓存的 this._childReactUnits
      // 看见新增删除都要本能注意缓存问题
      this._childReactUnits.push(nextChildReactUnit)
    }
  })

  return { nextChildReactUnits, nextChildReactUnitsMap }
}
```

**解释：**

`prevChildReactUnitsMap` 可以看做 `{节点 A: key A, 节点 B: key B, 节点 C: key C, 节点 D: key D }` 一一对应的 **map**，循环 `nextChildReactElements`（5 个 li），通过 type，key 找到可复用节点，最终会返回更新数组`nextChildReactUnits` 其内容为：`[A(prevChildReactUnit), C(prevChildReactUnit), B(prevChildReactUnit), E(nextChildReactUnit), F(nextChildReactUnit)]`。

其中 `prevChildReactUnit.update(nextChildReactElement)` 等同于 `li.update(nextChildReactElement)` 会重新进入 `DomElementUnit.update` 逻辑，先更新 **li** 的 props，其 children 会再进入 `updateReuseSelfAndGetNextChildReactUnits` 由于 `shouldDeepCompare(prevChildReactElement, nextChildReactElement)` 比较文本返回 `true` 会调用 `TextUnit.update(nextChildReactElement)` 递归完成复用节点的更新。

有了 `nextChildReactUnits` 和 `prevChildReactUnits` 就是万众期待的 dom diff 算法了，

**画一张图帮助理解：**

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220531-49e.png)

**具体算法：** 循环新节点集合 `nextChildReactUnits`，遍历到 A 通过 key 找到旧节点集合中 A，比较发现 A 可复用（原因：`nextChildReactUnits.push(prevChildReactUnit)`），并且 A 的 `_mountedIndex === lastIndex === 0`，所以 A 原地复用，更新 `lastIndex = Math.max(0, 0) = 0`，更新 `_mountedIndex` 为当前索引 0，遍历到 C，C 也可复用，但其 `_mountedIndex === 2 > lastIndex === 0`，所以 C 原地复用，更新 `lastIndex = Math.max(2, 0) = 2`，更新 `_mountedIndex` 为当前索引 1，遍历到 B，B 也复用，但其 `_mountedIndex === 1 < lastIndex === 2`，所以 B 需要移动，更新 `lastIndex = Math.max(2, 1) = 2`，更新 `_mountedIndex` 为当前索引 2，移动规制为从原来的索引 1 处移到索引 2 处，遍历到 E，F，由于无法复用，所以执行插入逻辑，插入位置是当前索引 3， 4，更新 `_mountedIndex` 为 3， 4。循环旧节点集合，发现节点 D 不在新节点集合中，执行删除逻辑。

**具体代码：**

```js
diffChildren(nextChildReactElements) {
  // 将旧 reactUnits 转换成 map
  // map 用 key 来辅助查找是否复用节点
  // 可复用就代表 reactUnit 可以复用，不可复用就代表 reactUnit 需要重新创建
  const prevChildReactUnitsMap = this.mapPrevChildReactUnits(this._childReactUnits)

  // nextChildReactUnits 可以理解为设计图，diff 就是得到设计图，patch 就是把旧节点按照设计图的样子更新成新节点，就是旧到新的操作过程
  // 设计图 === [a(复用),c(复用),b(复用),e,f] 和 旧 [a,b,c,d（删）] diff 就可以得到 patch 操作
  const { nextChildReactUnits, nextChildReactUnitsMap } =
    this.updateReuseSelfAndGetNextChildReactUnits(prevChildReactUnitsMap, nextChildReactElements)

  // 根据设计图 diff 出 patch 操作
  let lastIndex = 0

  // 这里是 diff 的是新节点和老节点
  nextChildReactUnits.forEach((nextChildReactUnit, idx) => {
    const nextKey = nextChildReactUnit._currentReactElement?.props?.key ?? `${idx}`
    const prevChildReactUnit = prevChildReactUnitsMap[nextKey]
    // 旧节点是否可复用，复用移动，不复用插入新的节点
    if (nextChildReactUnit === prevChildReactUnit) {
      if (prevChildReactUnit._mountedIndex < lastIndex) {
        patchList.push({
          parentId: this._react_id,
          parentNode: document.querySelector(`[data-react_id="${this._react_id}"]`),
          type: effects.MOVE,
          fromIndex: prevChildReactUnit._mountedIndex,
          toIndex: idx
        })
      }
      lastIndex = Math.max(lastIndex, prevChildReactUnit._mountedIndex)
    } else {
      // type 不同情况
      // 在上一步 jsx diff 会把比如：span 是新增的节点也会放入 nextChildReactUnits
      // 就会存在 key 相等但不是复用的节点，需要删除它
      if (prevChildReactUnit) {
        patchList.push({
          parentId: this._react_id,
          parentNode: document.querySelector(`[data-react_id="${this._react_id}"]`),
          type: effects.REMOVE,
          fromIndex: prevChildReactUnit._mountedIndex
        })
        // 删除节点需要解绑事件，也需要把 _childReactUnits，过滤掉老得删掉的
        this._childReactUnits = this._childReactUnits.filter(item => item !== prevChildReactUnit)
      }
      patchList.push({
        parentId: this._react_id,
        parentNode: document.querySelector(`[data-react_id="${this._react_id}"]`),
        type: effects.INSERT,
        toIndex: idx,
        insertDOMString: nextChildReactUnit.create(`${this._react_id}_${idx}`)
      })
    }
    // 缓存已经更新的 _mountedIndex，等待更新做为下次更新的上一次的索引
    nextChildReactUnit._mountedIndex = idx
  })

  // 旧节点中再行节点中不在的要删掉
  Object.keys(prevChildReactUnitsMap).forEach(key => {
    if (!(key in nextChildReactUnitsMap)) {
      patchList.push({
        parentId: this._react_id,
        parentNode: document.querySelector(`[data-react_id="${this._react_id}"]`),
        type: effects.REMOVE,
        fromIndex: prevChildReactUnitsMap[key]._mountedIndex
      })
      // 删除后需要更新 _childReactUnits
      this._childReactUnits = this._childReactUnits.filter(
        item => item !== prevChildReactUnitsMap[key]
      )
    }
  })
}
```

**最后得到 patchList 为如下：**

![](https://raw.githubusercontent.com/chuenwei0129/my-picgo-repo/master/fe-engineering/SCR-20220531-4y6.png)

### 具体代码

#### 文本节点

**代码 `commit` ：**[0f18990b715471fdfd9d14353dbac6a9d98935d3](https://github.com/chuenwei0129/build-my-own-x/commit/0f18990b715471fdfd9d14353dbac6a9d98935d3)

#### DOM 元素元素属性及文本

**代码 `commit` ：**[18eb4055e322fa0c27d1c6708373d6ed71b078d1](https://github.com/chuenwei0129/build-my-own-x/commit/18eb4055e322fa0c27d1c6708373d6ed71b078d1)

#### dom diff

##### 组件 diff

**代码 `commit` ：**[e6312e710de9c7f139a2a6690cdda911bac66d10](https://github.com/chuenwei0129/build-my-own-x/commit/e6312e710de9c7f139a2a6690cdda911bac66d10)

##### 同级 children 节点都可复用

**代码 `commit` ：**[89a45a4bddc088660f6ff246810f53d95cd0388c](https://github.com/chuenwei0129/build-my-own-x/commit/89a45a4bddc088660f6ff246810f53d95cd0388c)

**BUG 修复：**[75786e33bce3a58dabb8a08ac19ad86625b3f1ca](https://github.com/chuenwei0129/build-my-own-x/commit/75786e33bce3a58dabb8a08ac19ad86625b3f1ca)

##### diff & patch

**代码 `commit` ：**[39fc9abdd29637d7b87e88b9c61167d7cc06e482](https://github.com/chuenwei0129/build-my-own-x/commit/39fc9abdd29637d7b87e88b9c61167d7cc06e482)
