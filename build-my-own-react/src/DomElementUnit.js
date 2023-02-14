import { createReactUnit } from './creactUnit.js'
import { shouldDeepCompare } from './shouldDeepCompare.js'
import { Unit } from './Unit.js'

const effects = {
  INSERT: 'INSERT',
  MOVE: 'MOVE',
  REMOVE: 'REMOVE'
}

let patchList = []
let updateDepth = 0 // 深度，标识是否 diff 结束

export class DomElementUnit extends Unit {
  // 返回值也是 dom 字串
  create(react_id) {
    this._react_id = react_id
    this._childReactUnits = []

    const { type, props } = this._currentReactElement

    // 递归生成 dom 字串的拼接
    let allChildDomString = ''
    let tagStart = `<${type} data-react_id="${react_id}"`
    const tagEnd = `</${type}>`
    // 处理元素自身属性
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
        // 因为此时生成的 dom 字串还未挂载到 root 节点，所以需要异步处理
        setTimeout(() => {
          document.querySelector(`${type}`).addEventListener(eventName, val)
        })
      } else if (key === 'children') {
        // 递归处理子元素
        val.forEach((el, idx) => {
          // 子元素能是文本节点或者 DOM 元素
          // el 是 文本节点会调用 textUnit 的 create 函数
          // el 是 DOM 元素会调用 domElementUnit 的 create 函数
          const childReactUnit = createReactUnit(el)

          // 给每个节点加索引位置，方便更新时 patch 处理
          childReactUnit._mountedIndex = idx
          // 缓存所有子元素对应的 ReactUnit 实例，更新时需要调用其更新子元素对应的 dom
          this._childReactUnits.push(childReactUnit)

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

  // 更新 props
  updateProps(prevProps, nextProps) {
    // 更新策略比较暴力，直接循环新旧 jsx 属性
    // 新的 jsx 重新设置属性（设置包含新增和修改），旧的不在的删除
    // 直接在 dom 上操作
    for (const [key, val] of Object.entries(nextProps)) {
      if (key === 'children') {
        // children 属性单独递归处理
        continue
      } else if (/^on[A-Z]/.test(key)) {
        // 重新绑定事件
        const eventName = key.slice(2).toLowerCase()
        setTimeout(() => {
          document
            .querySelector(`[data-react_id="${this._react_id}"]`)
            .addEventListener(eventName, val)
        })
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

  // 更新 children
  // 由于递归所以需要深度判断，保证 patch 执行一次
  // ul -> li -> text 结构：ul 会调用，复用的 li 节点更新 text 会调用
  // G 节点内容没变也会进入逻辑
  updateChildren(nextChildReactElements) {
    updateDepth++
    this.diffChildren(nextChildReactElements)
    updateDepth--
    if (updateDepth === 0) {
      // 遍历结束，patch 差异
      this.patch(patchList)
      patchList.length = 0
    }
  }

  // 因为 reactUnit 上有旧 jsx，create，update 方法，所以用来辅助 diff 操作
  mapPrevChildReactUnits(childReactUnits) {
    const map = {}
    childReactUnits.forEach((unit, idx) => {
      // key 和 react 单元实例一一对应
      map[unit._currentReactElement.props?.key ?? `${idx}`] = unit
    })
    // map = {key1: reactUnit1, key2: reactUnit2...}
    return map
  }

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

  // dom 操作
  patch(patchList) {
    const willRemoveNodes = [] // 删除
    const reuseNodesMap = {} // 暂时存储复用
    patchList.forEach(node => {
      if (node.type === effects.MOVE || node.type === effects.REMOVE) {
        const prevNode = node.parentNode.children[node.fromIndex]
        // node.fromIndex 这里会有命名空间问题，嵌套几层会共用一个 fromIndex
        reuseNodesMap[node.fromIndex] = prevNode
        willRemoveNodes.push(prevNode)
      }
    })
    willRemoveNodes.forEach(node => node.remove())
    // 必须分开写，删除和插入放在一个循环里会节点错乱
    // 插入两种情况 index 是否占有，有在前插入，无在后插
    patchList.forEach(node => {
      const oldNode = node.parentNode.children[node.toIndex]
      if (node.type === effects.MOVE) {
        const repeatedNode = reuseNodesMap[node.fromIndex]
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
