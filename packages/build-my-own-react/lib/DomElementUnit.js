import { createReactUnit } from './creactUnit.js'
import { shouldDeepCompare } from './shouldDeepCompare.js'
import { Unit } from './Unit.js'

const effects = {
  INSERT: 'INSERT',
  MOVE: 'MOVE',
  REMOVE: 'REMOVE'
}

let diffQueue = [] // 队列存储差异
let updateDepth = 0 // 深度，标识是否 diff 结束

export class DomElementUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    // 用于 update 存储子单元
    this._childReactUnits = []
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
        // 事件可以挂在 document 上再处理
        // document.addEventListener(eventName, val)
        // 因为此时生成的 react 元素还未挂载到 root 节点，所以需要异步处理
        setTimeout(() => {
          document.querySelector(`${type}`).addEventListener(eventName, val)
        })
      } else if (key === 'children') {
        val.forEach((el, idx) => {
          // 调用 create 方法生成对应的 dom 字串
          // 子元素可以是文本节点或者 DOM 元素
          // 平级的迭代生成 react 单元，子元素递归
          const childReactUnit = createReactUnit(el)
          // 缓存 childReactUnit 更新时需要
          this._childReactUnits.push(childReactUnit)
          const childReactDomString = childReactUnit.create(`${react_id}_${idx}`)
          allChildDomString += childReactDomString
          // 给每个渲染单元节点加插入时的索引位置
          childReactUnit._mountedIndex = idx
        })
      } else {
        // 其它不需要特殊处理的属性
        tagStart = tagStart + `${key}="${val}"`
      }
    }
    return tagStart + '>' + allChildDomString + tagEnd
  }

  updateCurrentDomProps(prevProps, nextProps) {
    // 更新策略比较暴力，直接循环新旧 jsx 自身属性，新的 jsx 重新设置属性，旧的现在不在的属性需要删除
    // 循环新属性等于重新设置一遍
    for (const [key, val] of Object.entries(nextProps)) {
      if (key === 'children') {
        // children 属性单独递归处理
        continue
      } else if (/^on[A-Z]/.test(key)) {
        // 重新绑定事件
        const eventName = key.slice(2).toLowerCase()
        document.addEventListener(eventName, val)
      } else if (key === 'style') {
        // 重新指定 style
        Object.entries(val).forEach(([k, v]) => {
          document.querySelector(`[data-react_id="${this._react_id}"]`).style[k] = v
        })
      } else if (key === 'className') {
        // 即使 className 没改变依然会执行
        document.querySelector(`[data-react_id="${this._react_id}"]`).setAttribute('class', val)
      } else {
        document.querySelector(`[data-react_id="${this._react_id}"]`).setAttribute(key, val)
      }
    }
    // 循环旧属性，删除多余的属性
    for (const key of Object.keys(prevProps)) {
      if (!(key in nextProps)) {
        document.querySelector(`[data-react_id="${this._react_id}"]`).removeAttribute(key)
      }
      // 解绑旧属性上的事件
      // ...
    }
  }

  // children 可能是文本节点或者其它元素
  updateCurrentDomChildren(nextChildReactElements) {
    // updateDepth++
    this.diff(diffQueue, nextChildReactElements) // diff 是递归遍历的
    // updateDepth--
    // if (updateDepth === 0) {
    //   // 遍历结束，patch 差异
    //   this.patch(diffQueue)
    //   diffQueue.length = 0
    // }
  }

  update(nextReactElement) {
    // nextReactElement === 最外层 'div' jsx
    // 更新 props
    const prevProps = this._currentReactElement.props
    const nextProps = nextReactElement.props

    // 更新自身 dom 属性
    this.updateCurrentDomProps(prevProps, nextProps)
    // dom 属性更新完毕，更新 children
    this.updateCurrentDomChildren(nextReactElement.props.children)
  }

  // 生成旧的 [h1, p, button] 对应的 react 单元 map
  mapPrevChildReactUnits(childReactUnits) {
    const map = {}
    childReactUnits.forEach((unit, idx) => {
      // 单元实例上挂着旧的 jsx，可以取到 key 值
      // key 和 react 单元实例一一对应
      // 用户不指定 key 就默认 0, 1, 2...
      map[unit._currentReactElement.props?.key ?? `${idx}`] = unit
    })
    // map = {key: reactUnit}
    return map
  }

  getNextChildReactUnits(prevChildReactUnitsMap, nextChildReactElements) {
    // 复用指的是 reactUnit 可以复用，不需要重新创建
    // 新 react 单元
    const nextChildReactUnits = []
    // 新 react 单元 map
    const nextChildReactUnitsMap = {}

    // 先通过 key 查找是否可复用，dom 绑定的 key 不变代表可复用
    // 把数组序列 id 当作的 key，dom 绑定的 key 会变化，不能复用
    nextChildReactElements.forEach((nextChildReactElement, idx) => {
      // 遍历的第一个 jsx 的 key
      const nextKey = nextChildReactElement.props?.key ?? `${idx}`
      // 通过 key 拿到可复用的单元
      const prevChildReactUnit = prevChildReactUnitsMap[nextKey]
      // 获取旧的 jsx
      const prevChildReactElement = prevChildReactUnit?._currentReactElement
      // 同级 dom 比较，是否 type 相同
      if (shouldDeepCompare(prevChildReactElement, nextChildReactElement)) {
        // type 相同，复用旧 react 单元，传入新 jsx，更新
        // 到这里，可以实现 三个节点同级，但是 type 相同的情况，这是文档 commit 第二步
        // 不需要动作的更新，需要动作的更新
        prevChildReactUnit.update(nextChildReactElement)
        // nextChildReactUnits 是已经有最新状态的单元，只差 patch
        nextChildReactUnits.push(prevChildReactUnit)
        nextChildReactUnitsMap[nextKey] = prevChildReactUnit
      } else {
        // 为什么=出bug是因为通过key会多出span，通过key判定，行数组是老节点也在里面
        // type 不同，无法复用，创建新的 react 单元
        const nextChildReactUnit = createReactUnit(nextChildReactElement)
        //  nextChildReactUnit 单元
        nextChildReactUnits.push(nextChildReactUnit)
        nextChildReactUnitsMap[nextKey] = nextChildReactUnit
        // 第二个 bug 循环错乱 _childReactUnits，删除处也要处理
        // this._childReactUnits[idx] = nextChildReactUnit
      }
    })

    // 新旧 react 单元混合的需要更新的单元，可复用与新建的单元混合
    return { nextChildReactUnits, nextChildReactUnitsMap }
  }

  // diff 算法
  diff(diffQueue, nextChildReactElements) {
    // nextChildReactElements === 新的 [h1, p, button] jsx
    // 拿到旧的 [h1, p, button] 对应的 react 单元 map
    const prevChildReactUnitsMap = this.mapPrevChildReactUnits(this._childReactUnits)

    // 传入旧 react 单元组和新 jsx => 新 react 单元组: 里面的内容是新的
    const { nextChildReactUnits, nextChildReactUnitsMap } = this.getNextChildReactUnits(
      prevChildReactUnitsMap,
      nextChildReactElements
    )

    // 处理 dom
    let lastIndex = 0 // 老得单元数组最后一个不移动复用节点的索引位置

    // 遍历混合的所有更新好状态的新的 react 单元组
    // 复用是更新才存在
    // 遍历 旧 去掉 d
    // 遍历新的，确定 patch 动作
    // [a, b, c, d] diff [a, b, c, e, f]
    nextChildReactUnits.forEach((nextChildReactUnit, idx) => {
      // 拿到新的 react 单元组 的 key
      const nextKey = nextChildReactUnit._currentReactElement?.props?.key ?? `${idx}`
      const prevChildReactUnit = prevChildReactUnitsMap[nextKey]
      // 旧节点是否可复用，复用移动，不复用插入新的节点
      if (nextChildReactUnit === prevChildReactUnit) {
        if (prevChildReactUnit._mountedIndex < lastIndex) {
          diffQueue.push({
            parentId: this._react_id,
            parentNode: document.querySelector(`[data-react_id="${this._react_id}"]`),
            type: effects.MOVE,
            // eslint-disable-next-line sort-keys
            fromIndex: prevChildReactUnit._mountedIndex,
            toIndex: idx
          })
        }
        lastIndex = Math.max(lastIndex, prevChildReactUnit._mountedIndex)
      } else {
        // type 不同情况
        // key 相等但无法复用的节点，原因，新数组是把复用和不复用的都放里面 diff
        if (prevChildReactUnit) {
          diffQueue.push({
            parentId: this._react_id,
            parentNode: document.querySelector(`[data-react_id="${this._react_id}"]`),
            type: effects.REMOVE,
            // eslint-disable-next-line sort-keys
            fromIndex: prevChildReactUnit._mountedIndex
          })
          // 删除节点需要 解绑事件，也需要把 _childReactUnits，过滤掉老得删掉的
          this._childReactUnits = this._childReactUnits.filter(item => item !== prevChildReactUnit)
        }
        diffQueue.push({
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
        diffQueue.push({
          parentId: this._react_id,
          parentNode: document.querySelector(`[data-react_id="${this._react_id}"]`),
          type: effects.REMOVE,
          fromIndex: prevChildReactUnitsMap[key]._mountedIndex
        })
        // 更新 _childReactUnits
        this._childReactUnits = this._childReactUnits.filter(
          item => item !== prevChildReactUnitsMap[key]
        )
      }
    })
  }

  patch(diffQueue) {
    // 处理 dom 操作
    const willRemovedNodes = [] // 删除
    const repeatedNodesMap = {} // 暂时存储复用
    diffQueue.forEach(node => {
      if (node.type === effects.MOVE || node.type === effects.REMOVE) {
        const prevNode = node.parentNode.children[node.fromIndex]
        // node.fromIndex 这里会有命名空间问题，嵌套几层会共用一个fromIndex
        repeatedNodesMap[node.fromIndex] = prevNode
        willRemovedNodes.push(prevNode)
      }
    })
    willRemovedNodes.forEach(node => node.remove())
    // 分开写，删除和插入放在一个循环里会节点错乱
    // 插入两种情况index是否占有，有在前插入无在后插
    diffQueue.forEach(node => {
      const oldNode = node.parentNode.children[node.toIndex]
      if (node.type === effects.MOVE) {
        const repeatedNode = repeatedNodesMap[node.fromIndex]
        oldNode ? oldNode.before(repeatedNode) : node.parentNode.appendChild(repeatedNode)
      }
      if (node.type === effects.INSERT) {
        oldNode
          ? oldNode.insertAdjacentHTML('beforebegin', node.insertDOMString)
          : node.parentNode.insertAdjacentHTML('beforeend', node.insertDOMString)
      }
    })
  }
}
