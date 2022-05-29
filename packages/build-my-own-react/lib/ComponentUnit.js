import { createReactUnit } from './creactUnit.js'
import { shouldDeepCompare } from './shouldDeepCompare.js'
import { Unit } from './Unit.js'

export class ComponentUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    const { type: Component, props } = this._currentReactElement
    // 实例化用户定义的 React.Component，形如：<Counter name="计数器">，注入写在其标签上的 props，并把组件实例挂到 unit 实例上
    this._instanceComponent = new Component(props)

    // 把 _instanceComponent 组件和 当前 react 渲染组件单元 _currentUnit 建立联系
    this._instanceComponent._currentReactUnit = this

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

  // 调用顺序：componentUnit.update => domUnit.update => textUnit.update
  // nextReactElement 参数：null => <Counter> 组件返回的 jsx => 子节点中非 React.createElement() 部份，形如：this.state.count
  update(nextReactElement, nextState) {
    // nextReactElement 是对应 setState 所在的组件返回的 jsx
    // 是否更新 reactElement 上的 props 属性，比如 <Counter name="计数器">，更新 name 属性
    // 旧的
    const prevProps = this._currentReactElement?.props
    // 新的
    let nextProps = nextReactElement?.props
    nextProps = nextProps ?? prevProps

    // state 在创建时是用户传入的，更新时是用户调用 setState 方法时传入的
    // state 是用户定义在 jsx 上的，运行时才能获取到

    // 核心：更新状态
    this._instanceComponent.state = { ...this._instanceComponent.state, ...nextState }

    // componentWillUpdate 钩子
    this._instanceComponent.componentWillUpdate && this._instanceComponent.componentWillUpdate()

    // if (
    //   this._instanceComponent.shouldComponentUpdate &&
    //   !this._instanceComponent.shouldComponentUpdate(nextProps, nextState)
    // ) {
    //   // eslint-disable-next-line no-useless-return
    //   return
    // }

    // 获取新的 jsx 元素
    this._nextRenderReturnReactElement = this._instanceComponent.render()

    // 组件级别的 diff
    // 新老 jsx 元素对比
    if (
      shouldDeepCompare(
        // 缓存的老的 jsx
        this._renderReturnReactUnit._currentReactElement,
        // 更新状态的新的 jsx
        this._nextRenderReturnReactElement
      )
    ) {
      // 组件 type 相同，对应节点单元传入新的状态
      // 一个组件更新，其子组件，dom 元素，文本节点都会更新
      // 递归执行最终递归到文本单元
      // 相同复用，逻辑转到下一级
      this._renderReturnReactUnit.update(this._nextRenderReturnReactElement)
    } else {
      // type 不同，整个 type 替换
      // 代码执 create 是调用的 domUnit.create，上面并没有 this._renderReturnReactUnit 逻辑
      // 所以 this._renderReturnReactUnit._currentReactElement 并没有更新
      // 所以出 bug
      document.querySelector(`[data-react_id="${this._react_id}"]`).outerHTML = createReactUnit(
        this._nextRenderReturnReactElement
      ).create(this._react_id)

      // 解决：手动更新 jsx 元素
      // _renderReturnReactUnit 从名字就可以看出只有 component 才有
      this._renderReturnReactUnit._currentReactElement = this._nextRenderReturnReactElement
    }

    // componentDidUpdate 钩子
    this._instanceComponent.componentDidUpdate && this._instanceComponent.componentDidUpdate()
  }
}
