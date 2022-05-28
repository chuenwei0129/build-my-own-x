import { createReactUnit } from './creactUnit.js'
import { Unit } from './Unit.js'

export class DomElementUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    // this._childReactUnits = []
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
          // 给每个渲染单元节点加索引
          // childReactUnit._mountedIndex = idx
          // this._childReactUnits.push(childReactUnit)
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
  // update(nextReactElement) {
  //   // console.log('nextReactElement', nextReactElement)
  //   const prevProps = this._currentReactElement.props
  //   const nextProps = nextReactElement.props
  //   this.updateDOMProps(prevProps, nextProps)
  //   // 先更新自生dom属性，在更新儿子dom，参数是儿子react元素
  //   this.updateDOMChildren(nextReactElement.props.children)
  // }
  // // 获取老得儿子
  // getPrevChildReactUnitsMap(childReactUnits) {
  //   // key 和 react单元一一对应
  //   const map = {}
  //   childReactUnits.forEach((unit, idx) => {
  //     map[unit._currentReactElement.props?.key ?? `${idx}`] = unit
  //   })
  //   return map
  // }
  // getNextChildReactUnits(prevChildReactUnitsMap, nextChildReactElements) {
  //   const nextChildReactUnits = []
  //   const nextChildReactUnitsMap = {}
  //   // console.log('旧的子 react 元素', prevChildReactUnitsMap)
  //   // console.log('新的子 react元素', nextChildReactElements)
  //   // 先通过 key 查找老得有没有可用的，没有就创建新的，返回一个新的单元
  //   nextChildReactElements.forEach((nextChildReactElement, idx) => {
  //     const nextKey = nextChildReactElement.props?.key ?? `${idx}`
  //     const prevChildReactUnit = prevChildReactUnitsMap[nextKey]
  //     // 获取老得 react 元素
  //     const prevChildReactElement = prevChildReactUnit?._currentReactElement
  //     // 同级比较是否 type 相同，先更新
  //     if (shouldDeepCompare(prevChildReactElement, nextChildReactElement)) {
  //       // 先更新在加入新数组,复用
  //       prevChildReactUnit.update(nextChildReactElement)
  //       nextChildReactUnits.push(prevChildReactUnit)
  //       nextChildReactUnitsMap[nextKey] = prevChildReactUnit
  //     } else {
  //       // 新数组是老得复用新的创建的数组
  //       // 为什么=出bug是因为通过key会多出span，通过key判定，行数组是老节点也在里面
  //       const nextChildReactUnit = createReactUnit(nextChildReactElement)
  //       nextChildReactUnits.push(nextChildReactUnit)
  //       nextChildReactUnitsMap[nextKey] = nextChildReactUnit
  //       // 第二个 bug 循环错乱 _childReactUnits，删除处也要处理
  //       this._childReactUnits[idx] = nextChildReactUnit
  //     }
  //   })
  //   // console.log('新的react渲染单元', nextChildReactUnits)
  //   return { nextChildReactUnits, nextChildReactUnitsMap }
  // }
  // // diff算法
  // diff(diffQueue, nextChildReactElements) {
  //   const prevChildReactUnitsMap = this.getPrevChildReactUnitsMap(this._childReactUnits)
  //   const { nextChildReactUnits, nextChildReactUnitsMap } = this.getNextChildReactUnits(
  //     prevChildReactUnitsMap,
  //     nextChildReactElements
  //   )
  //   let lastIndex = 0 // 老得单元数组最后一个不移动复用节点的索引位置
  //   nextChildReactUnits.forEach((nextChildReactUnit, idx) => {
  //     const nextKey = nextChildReactUnit._currentReactElement?.props?.key ?? `${idx}`
  //     const prevChildReactUnit = prevChildReactUnitsMap[nextKey]
  //     // 旧节点是否可复用，复用移动，不复用插入新的节点
  //     if (nextChildReactUnit === prevChildReactUnit) {
  //       if (prevChildReactUnit._mountedIndex < lastIndex) {
  //         diffQueue.push({
  //           parentId: this._reactid,
  //           parentNode: document.querySelector(`[data-reactid="${this._reactid}"]`),
  //           type: types.MOVE,
  //           // eslint-disable-next-line sort-keys
  //           fromIndex: prevChildReactUnit._mountedIndex,
  //           toIndex: idx
  //         })
  //       }
  //       lastIndex = Math.max(lastIndex, prevChildReactUnit._mountedIndex)
  //     } else {
  //       // key相等但无法复用的节点，原因，新数组是把复用和不复用的都放里面 diff
  //       if (prevChildReactUnit) {
  //         diffQueue.push({
  //           parentId: this._reactid,
  //           parentNode: document.querySelector(`[data-reactid="${this._reactid}"]`),
  //           type: types.REMOVE,
  //           // eslint-disable-next-line sort-keys
  //           fromIndex: prevChildReactUnit._mountedIndex
  //         })
  //         // 删除节点需要 解绑事件，也需要把 _childReactUnits，过滤掉老得删掉的
  //         this._childReactUnits = this._childReactUnits.filter(item => item !== prevChildReactUnit)
  //       }
  //       diffQueue.push({
  //         parentId: this._reactid,
  //         parentNode: document.querySelector(`[data-reactid="${this._reactid}"]`),
  //         type: types.INSERT,
  //         // eslint-disable-next-line sort-keys
  //         toIndex: idx,
  //         // eslint-disable-next-line sort-keys
  //         insertDOMString: nextChildReactUnit.create(`${this._reactid}_${idx}`)
  //       })
  //     }
  //     nextChildReactUnit._mountedIndex = idx
  //   })
  //   // 旧节点中再行节点中不在的要删掉
  //   Object.keys(prevChildReactUnitsMap).forEach(key => {
  //     if (!(key in nextChildReactUnitsMap)) {
  //       diffQueue.push({
  //         parentId: this._reactid,
  //         parentNode: document.querySelector(`[data-reactid="${this._reactid}"]`),
  //         type: types.REMOVE,
  //         // eslint-disable-next-line sort-keys
  //         fromIndex: prevChildReactUnitsMap[key]._mountedIndex
  //       })
  //       this._childReactUnits = this._childReactUnits.filter(
  //         item => item !== prevChildReactUnitsMap[key]
  //       )
  //     }
  //   })
  // }
  // updateDOMChildren(nextChildReactElements) {
  //   // eslint-disable-next-line no-unused-vars
  //   updateDepth++
  //   this.diff(diffQueue, nextChildReactElements) // diff 是递归遍历的
  //   console.log('diff队列', diffQueue)
  //   // eslint-disable-next-line no-unused-vars
  //   updateDepth--
  //   if (updateDepth === 0) {
  //     // 遍历结束，响应页面
  //     this.patch(diffQueue)
  //     diffQueue = []
  //   }
  // }
  // patch(diffQueue) {
  //   // 处理 dom 操作
  //   const willRemovedNodes = [] // 删除
  //   const repeatedNodesMap = {} // 暂时存储复用
  //   diffQueue.forEach(node => {
  //     if (node.type === types.MOVE || node.type === types.REMOVE) {
  //       const prevNode = node.parentNode.children[node.fromIndex]
  //       // node.fromIndex 这里会有命名空间问题，嵌套几层会共用一个fromIndex
  //       repeatedNodesMap[node.fromIndex] = prevNode
  //       willRemovedNodes.push(prevNode)
  //     }
  //   })
  //   willRemovedNodes.forEach(node => node.remove())
  //   // 分开写，删除和插入放在一个循环里会节点错乱
  //   // 插入两种情况index是否占有，有在前插入无在后插
  //   diffQueue.forEach(node => {
  //     const oldNode = node.parentNode.children[node.toIndex]
  //     if (node.type === types.MOVE) {
  //       const repeatedNode = repeatedNodesMap[node.fromIndex]
  //       oldNode ? oldNode.before(repeatedNode) : node.parentNode.appendChild(repeatedNode)
  //     }
  //     if (node.type === types.INSERT) {
  //       oldNode
  //         ? oldNode.insertAdjacentHTML('beforebegin', node.insertDOMString)
  //         : node.parentNode.insertAdjacentHTML('beforeend', node.insertDOMString)
  //     }
  //   })
  // }
  // updateDOMProps(prevProps, nextProps) {
  //   // 循环新属性
  //   for (const [key, val] of Object.entries(nextProps)) {
  //     if (key === 'children') {
  //       // 先不处理
  //       continue
  //     } else if (/^on[A-Z]/.test(key)) {
  //       const eventName = key.slice(2).toLowerCase()
  //       document.addEventListener(eventName, val)
  //     } else if (key === 'style') {
  //       Object.entries(val).forEach(([k, v]) => {
  //         document.querySelector(`[data-reactid="${this._reactid}"]`).style[k] = v
  //       })
  //     } else if (key === 'className') {
  //       // class
  //       document.querySelector(`[data-reactid="${this._reactid}"]`).setAttribute('class', val)
  //     } else {
  //       document.querySelector(`[data-reactid="${this._reactid}"]`).setAttribute(key, val)
  //     }
  //   }
  //   // 循环旧属性
  //   for (const key of Object.keys(prevProps)) {
  //     if (!(key in nextProps)) {
  //       document.querySelector(`[data-reactid="${this._reactid}"]`).removeAttribute(key)
  //     }
  //     // 解绑事件
  //   }
  // }
}
