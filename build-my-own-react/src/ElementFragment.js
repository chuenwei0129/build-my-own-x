import { createFragmentInstance } from './createFragmentInstance.js'
import { shouldDeepCompare } from './shouldDeepCompare.js'
import { Fragment } from './Fragment.js'

const effects = {
  INSERT: 'INSERT',
  MOVE: 'MOVE',
  REMOVE: 'REMOVE',
}

let patchList = []
let updateDepth = 0 // 深度，标识是否 diff 结束

export class ElementFragment extends Fragment {
  create(react_id) {
    this._react_id = react_id
    const { type, props } = this._currentReactElement

    this._fragmentInstances = []
    let elementFragment = ''

    let tagStart = `<${type} data-react_id="${react_id}"`
    const tagEnd = `</${type}>`

    for (const [key, val] of Object.entries(props)) {
      if (key === 'className') {
        tagStart = tagStart + `class="${val}"`
      } else if (key === 'style') {
        // style 的处理：驼峰转 '-'
        const style = Object.entries(val)
          .map(([k, v]) => {
            return `${k.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`
          })
          .join(';')
        tagStart = tagStart + `style="${style}"`
      } else if (/^on[A-Z]/.test(key)) {
        const eventName = key.slice(2).toLowerCase()
        setTimeout(() => {
          // 此时生成的 fragment 还未挂载到 container 上，所以需要延迟绑定事件
          document.querySelector(`${type}`).addEventListener(eventName, val)
          // 事件代理：document.addEventListener(eventName, val)
        })
      } else if (key === 'children') {
        val.forEach((element, idx) => {
          // children 子元素可能是文本节点或者 DOM 元素
          const fragmentInstance = createFragmentInstance(element)
          // 给每个 fragmentInstance 加索引位置，方便更新时 patch 处理
          fragmentInstance._mountedIndex = idx
          // 缓存所有子元素对应的 fragment 实例，更新时需要用到
          this._fragmentInstances.push(fragmentInstance)
          const fragment = fragmentInstance.create(`${react_id}_${idx}`)
          elementFragment += fragment
        })
      } else {
        // 其它不需要特殊处理的属性
        tagStart = tagStart + `${key}="${val}"`
      }
    }
    return tagStart + '>' + elementFragment + tagEnd
  }

  // 代码进入这里意味着根节点 tag 可复用
  update(nextReactElement) {
    this.updateProps(this._currentReactElement.props, nextReactElement.props)
    // 更新 children
    this.updateChildren(nextReactElement.props.children)
  }

  // 更新 props
  updateProps(prevProps, nextProps) {
    for (const [key, val] of Object.entries(nextProps)) {
      if (key === 'children') {
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
          document.querySelector(`[data-react_id="${this._react_id}"]`).style[
            k
          ] = v
        })
      } else if (key === 'className') {
        // 即使 className 没改变依然会执行
        document
          .querySelector(`[data-react_id="${this._react_id}"]`)
          .setAttribute('class', val)
      } else {
        document
          .querySelector(`[data-react_id="${this._react_id}"]`)
          .setAttribute(key, val)
      }
    }
    // 循环旧属性，删除多余的属性
    for (const key of Object.keys(prevProps)) {
      if (!(key in nextProps)) {
        document
          .querySelector(`[data-react_id="${this._react_id}"]`)
          .removeAttribute(key)
      }
      // 解绑旧属性上的事件
      // ...
    }
  }

  // 更新 children
  // 由于递归所以需要深度判断，保证 patch 执行一次
  updateChildren(nextReactElements) {
    updateDepth++
    this.diffChildren(nextReactElements)
    updateDepth--
    if (updateDepth === 0) {
      // 遍历结束，patch 差异
      this.patch(patchList)
      patchList.length = 0
    }
  }

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
          // key a 会因为 type 先为 li 后为 span，type 不同也会进入这里
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

  // dom 操作
  patch(patchList) {
    const willRemoveNodes = [] // 删除
    const reuseNodesMap = {} // 暂时存储复用
    patchList.forEach((node) => {
      if (node.type === effects.MOVE || node.type === effects.REMOVE) {
        const prevNode = node.parentNode.children[node.fromIndex]
        // node.fromIndex 这里会有命名空间问题，嵌套几层会共用一个 fromIndex
        reuseNodesMap[node.fromIndex] = prevNode
        willRemoveNodes.push(prevNode)
      }
    })
    willRemoveNodes.forEach((node) => node.remove())
    // 必须分开写，删除和插入放在一个循环里会节点错乱
    // 插入两种情况 index 是否占有，有在前插入，无在后插
    patchList.forEach((node) => {
      const oldNode = node.parentNode.children[node.toIndex]
      if (node.type === effects.MOVE) {
        const repeatedNode = reuseNodesMap[node.fromIndex]
        oldNode
          ? oldNode.before(repeatedNode)
          : node.parentNode.appendChild(repeatedNode)
      }
      if (node.type === effects.INSERT) {
        oldNode
          ? oldNode.insertAdjacentHTML('beforebegin', node.insertDOMString)
          : node.parentNode.insertAdjacentHTML(
              'beforeend',
              node.insertDOMString
            )
      }
    })
  }
}
