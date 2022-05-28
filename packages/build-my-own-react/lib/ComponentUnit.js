import { createReactUnit } from './creactUnit.js'
import { Unit } from './Unit.js'

export class ComponentUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    const { type: Component, props } = this._currentReactElement

    // 实例化用户定义的 React.Component，注入写在其标签上的 props，并把组件实例挂到 unit 实例上
    this._instanceComponent = new Component(props)

    // 把 _instanceComponent 组件和 当前 react 渲染组件单元 _currentUnit 建立联系
    this._instanceComponent._currentUnit = this

    // 调用实例的 componentWillMount 方法
    this._instanceComponent.componentWillMount && this._instanceComponent.componentWillMount()

    // 在组件实例挂载完毕后触发 componentDidMount 方法
    document.addEventListener('mounted', () => {
      this._instanceComponent.componentDidMount && this._instanceComponent.componentDidMount()
    })

    // 调用实例的 render 方法，返回的是 jsx 也就是 reactElement
    const renderReturnReactElement = this._instanceComponent.render()

    // 有了 reactElement 就可以创建对应的 react 单元（三种）组件，文本节点，dom 节点
    this._renderReturnReactUnit = createReactUnit(renderReturnReactElement)
    return this._renderReturnReactUnit.create(react_id)
  }
  // update(nextReactElement, nextState) {
  //   // 新的 props 是当前 react 单元的，如果不传就用老的props
  //   const prevProps = this._currentReactElement?.props
  //   let nextProps = nextReactElement?.props
  //   nextProps = nextProps ?? prevProps
  //   // 更新状态
  //   this._instanceComponent.state = { ...this._instanceComponent.state, ...nextState }

  //   this._instanceComponent.componentWillUpdate && this._instanceComponent.componentWillUpdate()

  //   if (
  //     this._instanceComponent.shouldComponentUpdate &&
  //     !this._instanceComponent.shouldComponentUpdate(nextProps, nextState)
  //   ) {
  //     // eslint-disable-next-line no-useless-return
  //     return
  //   }
  //   // 获取状态改变后的 react 元素
  //   this._nextReactElement = this._instanceComponent.render()

  //   // 新老 react 元素对比
  //   if (shouldDeepCompare(this._renderedReactUnit._currentReactElement, this._nextReactElement)) {
  //     // type 相同，更新老得节点
  //     // _nextReactElement调用对应的 react 单元update 方法
  //     this._renderedReactUnit.update(this._nextReactElement)
  //   } else {
  //     // type 不同，直接创建新的节点并插入dom
  //     document.querySelector(`[data-reactid="${this._reactid}"]`).innerHTML = createReactUnit(
  //       this._nextReactElement
  //     ).create(this._reactid)
  //   }
  //   this._instanceComponent.componentDidUpdate && this._instanceComponent.componentDidUpdate()
  // }
}
