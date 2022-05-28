import { Unit } from './Unit.js'

export class TextUnit extends Unit {
  // 创建 dom 节点字串
  create(react_id) {
    // 缓存 react_id 到实例单元上，由于递归基本上 id 可以一一对应节点
    this._react_id = react_id
    return `<span data-react_id=${this._react_id}>${this._currentReactElement}</span>`
  }

  // update(nextReactElement) {
  //   document.querySelector(`[data-reactid="${this._reactid}"]`).textContent = nextReactElement
  // }
}
