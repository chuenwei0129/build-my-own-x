import { createReactUnit } from './creactUnit.js'
import { shouldDeepCompare } from './shouldDeepCompare.js'
import { Unit } from './Unit.js'

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
          const childReactDomString = childReactUnit.create(`${react_id}_${idx}`)
          allChildDomString += childReactDomString

          // 缓存所有子元素对应的 ReactUnit 实例，更新时需要调用其更新子元素对应的 dom
          this._childReactUnits.push(childReactUnit)
        })
      } else {
        // 其它不需要特殊处理的属性
        tagStart = tagStart + `${key}="${val}"`
      }
    }
    return tagStart + '>' + allChildDomString + tagEnd
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
  updateChildren(nextChildReactElements) {
    this.diffChildren(nextChildReactElements)
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

  // 这一步已经更新了复用节点自身的 dom，并且返回 nextChildReactUnits 设计图
  // 设计图指明复用节点新增节点将来位于页面的位置
  updateReuseSelfAndGetNextChildReactUnits(prevChildReactUnitsMap, nextChildReactElements) {
    const nextChildReactUnits = []
    const nextChildReactUnitsMap = {}

    // 把数组序列 id 当作的 key，reactUnit 与 key 的绑定会变化，不是一一对应，无法使用 map 查找复用
    nextChildReactElements.forEach((nextChildReactElement, idx) => {
      // 遍历的第一个 jsx 的 key
      const nextKey = nextChildReactElement.props?.key ?? `${idx}`
      // 通过 nextChildReactElements key 拿到 key 对应的 prevChildReactUnit
      const prevChildReactUnit = prevChildReactUnitsMap[nextKey]
      const prevChildReactElement = prevChildReactUnit?._currentReactElement
      // 是否复用由 key type 共同决定
      // 通过新 key 找不打对应的旧单元，表明没有可复用单元，prevChildReactElement undefined，进入 else 逻辑
      // diff type
      if (shouldDeepCompare(prevChildReactElement, nextChildReactElement)) {
        // type 相同，复用旧 react 单元
        // 这里会调用 type 对应级别的 Unit.update 更新文本和属性，然后递归更新子元素的文本和属性
        // 由于迭代的是数组，所以所有单元都更新了。这一步已经完成了更新操作，接下来还需要移动，删除，插入等操作
        prevChildReactUnit.update(nextChildReactElement)
        // nextChildReactUnits 就是为接下来的操作准备的
        // 把复用的单元放入新 react 单元数组
        nextChildReactUnits.push(prevChildReactUnit)
        nextChildReactUnitsMap[nextKey] = prevChildReactUnit
      } else {
        // type 不同，无法复用，创建新的 react 单元
        const nextChildReactUnit = createReactUnit(nextChildReactElement)
        //  nextChildReactUnit 单元
        nextChildReactUnits.push(nextChildReactUnit)
        nextChildReactUnitsMap[nextKey] = nextChildReactUnit
        // 没有调用 nextChildReactUnit.create 无法更新 this._childReactUnits
        // 需要主动更新缓存的 this._childReactUnits
        // 看见新增删除都要本能注意缓存问题
        this._childReactUnits[idx] = nextChildReactUnit
      }
    })

    // 新旧 react 单元混合的需要更新的单元，可复用与新建的单元混合
    return { nextChildReactUnits, nextChildReactUnitsMap }
  }

  diffChildren(nextChildReactElements) {
    // 将旧 reactUnits 转换成 map
    // map 用 key 来辅助查找是否复用节点
    // 可复用就代表 reactUnit 可以复用，不可复用就代表 reactUnit 需要重新创建
    const prevChildReactUnitsMap = this.mapPrevChildReactUnits(this._childReactUnits)

    // 新的 jsx children 和 老的 reactUnits children 对比，diff 出新的 reactUnits children
    // nextChildReactUnits 包含复用的节点与新增的节点
    // nextChildReactUnits 可以理解为设计图，diff 就是得到设计图，patch 就是把旧 dom 按照设计图的样子更新，就是旧到新的操作过程
    // 设计图 === [a(复用),c(复用),b(复用),e,f] 和 旧 [a,b,c,d（删）] diff 就可以得到 patch 操作
    const { nextChildReactUnits, nextChildReactUnitsMap } =
      this.updateReuseSelfAndGetNextChildReactUnits(prevChildReactUnitsMap, nextChildReactElements)

    // 根据设计图 diff 出 patch 操作
  }

  // 代码进入这里意味着根节点 tag 可复用，可以 dom 上更新 props 和 diff 同级 children
  update(nextReactElement) {
    // create 处理得是 this._currentReactElement 对应的 jsx
    // update 处理得是 nextReactElement 对应的 jsx
    // nextReactElement 是一个对象，包含 type、props、children
    // 更新 dom 属性，就是处理 props，比如 className, style, onClick 等
    this.updateProps(this._currentReactElement.props, nextReactElement.props)
    // 处理完 props，再处理 children
    // 同级 diff
    this.updateChildren(nextReactElement.props.children)
  }

  // 生成旧的 [h1, p, button] 对应的 react 单元 map
  // mapPrevChildReactUnits(childReactUnits) {
  //   const map = {}
  //   childReactUnits.forEach((unit, idx) => {
  //     // 单元实例上挂着旧的 jsx，可以取到 key 值
  //     // key 和 react 单元实例一一对应
  //     // 用户不指定 key 就默认 0, 1, 2...
  //     map[unit._currentReactElement.props?.key ?? `${idx}`] = unit
  //   })
  //   // map = {key: reactUnit}
  //   return map
  // }
}
