// 用户调用的组件抽象类
export class Component {
  constructor(props) {
    this.props = props
  }

  // 调用 setState 方法，会触发 setState 所在组件对应的 react 单元的 update 方法，触发组件更新
  setState(nextState) {
    this._currentReactUnit.update(null, nextState)
  }
}
