import { Unit } from './Unit.js'

export class TextUnit extends Unit {
  // 创建 dom 节点字串
  create(react_id) {
    // 缓存 react_id 到实例单元上，由于递归，细粒度可以到文本节点 id 一一对应
    this._react_id = react_id
    return `<span data-react_id=${this._react_id}>${this._currentReactElement}</span>`
  }

  update(nextReactElement) {
    document.querySelector(`[data-react_id="${this._react_id}"]`).textContent = nextReactElement
  }
}
