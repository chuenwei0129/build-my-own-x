import { Fragment } from './Fragment.js'

export class TextFragment extends Fragment {
  create(react_id) {
    // react_id 与 dom 结构一一对应，粒度到 span
    this._react_id = react_id
    return `<span data-react_id=${react_id}>${this._currentReactElement}</span>`
  }

  update(nextReactElement) {
    // 更新时，直接替换文本内容
    document.querySelector(`[data-react_id="${this._react_id}"]`).textContent =
      nextReactElement
  }
}
