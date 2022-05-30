import { createReactUnit } from './creactUnit.js'
import { shouldDeepCompare } from './shouldDeepCompare.js'
import { Unit } from './Unit.js'

export class ComponentUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    // <Counter name="计数器">
    // 复合渲染的 jsx，比较特殊 {type: Counter 类, props: { name: '计数器' }, children: [...]}
    // type 可能为函数或类，这里只模拟类
    const { type: Component, props } = this._currentReactElement
    // <Counter name="计数器"> 这里注入的 props 是 name
    // 上一层 class 组件通过 props 传递到递归的下一层 class 组件
    // 执行：ComponentUnit => ComponentUnit => DomElementUnit => TextUnit
    this._instanceComponent = new Component(props)

    // 把 _instanceComponent 组件和处理实例的 _currentReactUnit 对应
    this._instanceComponent._currentReactUnit = this

    // componentWillMount 钩子
    this._instanceComponent.componentWillMount && this._instanceComponent.componentWillMount()

    // 在组件实例挂载完毕后触发 componentDidMount 方法
    document.addEventListener('mounted', () => {
      this._instanceComponent.componentDidMount && this._instanceComponent.componentDidMount()
    })

    // 调用实例的 render 方法，返回的是 jsx
    const renderReturnReactElement = this._instanceComponent.render()

    // 缓存 renderReturnReactElement 对应的 Unit
    // 递归处理 jsx
    this._renderReturnReactUnit = createReactUnit(renderReturnReactElement)
    return this._renderReturnReactUnit.create(react_id)
  }

  // 触发更新的源头组件传入的第一个参数为 null
  // 由于是递归更新组件套组件，所以需要把 nextReactElement 传递给子组件
  // 先不考虑组件套组件的情况
  update(nextReactElement, nextState) {
    // 组件套组件时会把 nextReactElement 传递给子组件
    const prevProps = this._currentReactElement?.props
    let nextProps = nextReactElement?.props
    nextProps = nextProps ?? prevProps

    // 核心：更新状态
    this._instanceComponent.state = { ...this._instanceComponent.state, ...nextState }

    // componentWillUpdate 钩子
    this._instanceComponent.componentWillUpdate && this._instanceComponent.componentWillUpdate()

    // shouldComponentUpdate 钩子
    if (
      this._instanceComponent.shouldComponentUpdate &&
      !this._instanceComponent.shouldComponentUpdate(nextProps, nextState)
    ) {
      return
    }

    // 获取新的 jsx 元素
    this._nextRenderReturnReactElement = this._instanceComponent.render()

    // 组件 diff 逻辑
    if (
      shouldDeepCompare(
        // 老的 jsx
        this._renderReturnReactUnit._currentReactElement,
        // 新的 jsx
        this._nextRenderReturnReactElement
      )
    ) {
      // 返回的 jsx 是文本的情况下 _renderReturnReactUnit 是 TextUnit
      // 返回的 jsx 是 dom 的情况下 _renderReturnReactUnit 是 DomElementUnit
      // 返回的 jsx 是 组件 的情况下 _renderReturnReactUnit 是 ComponentUnit
      // 递归处理新的 jsx
      this._renderReturnReactUnit.update(this._nextRenderReturnReactElement)
    } else {
      // type 不同，整个 type 替换
      // 代码执 create 是调用的 domUnit.create，上面并没有 this._renderReturnReactUnit 逻辑
      // 所以 this._renderReturnReactUnit._currentReactElement 并没有更新
      // 所以出 bug，需要手动更新 this._renderReturnReactUnit._currentReactElement
      document.querySelector(`[data-react_id="${this._react_id}"]`).outerHTML = createReactUnit(
        this._nextRenderReturnReactElement
      ).create(this._react_id)

      // _renderReturnReactUnit 只有 componentUnit 才有
      this._renderReturnReactUnit._currentReactElement = this._nextRenderReturnReactElement
    }

    // componentDidUpdate 钩子
    this._instanceComponent.componentDidUpdate && this._instanceComponent.componentDidUpdate()
  }
}
