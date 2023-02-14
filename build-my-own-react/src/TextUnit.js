import { Unit } from './Unit.js'

export class TextUnit extends Unit {
  create(react_id) {
    // 缓存 react_id，由于递归，粒度可以到文本节点
    // react_id 与 dom 结构一一对应
    this._react_id = react_id
    return `<span data-react_id=${react_id}>${this._currentReactElement}</span>`
  }

  update(nextReactElement) {
    // 直接 dom 替换文本节点
    document.querySelector(`[data-react_id="${this._react_id}"]`).textContent = nextReactElement
  }
}
