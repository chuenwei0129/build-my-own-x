import { createReactElement as createElement } from './creactElement.js'

// 用户调用的组件抽象类
export class Component {
  constructor(props) {
    this.props = props
  }
  setState(nextState) {
    this._currentReactUnit.update(null, nextState)
  }
}

export default {
  Component,
  createElement
}
