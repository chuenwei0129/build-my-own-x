import { createReactElement as createElement } from '../../build-my-own-react-15/lib/creactElement.js'

// react 组件抽象类
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
