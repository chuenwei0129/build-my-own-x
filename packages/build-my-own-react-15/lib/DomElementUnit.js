import { createReactUnit } from './creactUnit.js'
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
    this._childReactUnits.forEach((childReactUnit, idx) => {
      childReactUnit.update(nextChildReactElements[idx])
    })
  }

  // 更新
  update(nextReactElement) {
    // create 处理得是 this._currentReactElement 对应的 jsx
    // update 处理得是 nextReactElement 对应的 jsx
    // nextReactElement 是一个对象，包含 type、props、children
    // 更新 dom 属性，就是处理 props，比如 className, style, onClick 等
    this.updateProps(this._currentReactElement.props, nextReactElement.props)
    // 处理完 props，再处理 children
    // 假设 children 节点都可以复用
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
