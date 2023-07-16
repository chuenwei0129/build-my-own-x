import { createReactElement as createElement } from './createElement.js'

// react 组件抽象类
export class Component {
  // 组件关联的 fragment 实例
  _connectedFragmentInstance = null
  constructor(props) {
    this.props = props
  }

  // 更新状态
  setState(nextState) {
    // 组件 setState 调用时 this._connectedFragmentInstance 必定已经关联了 fragment 实例
    this._connectedFragmentInstance.update(null, nextState)
  }
}

export default {
  Component,
  createElement,
}
