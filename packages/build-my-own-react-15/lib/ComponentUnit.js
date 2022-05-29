import { createReactUnit } from './creactUnit.js'
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

    // 递归处理 jsx
    this._renderReturnReactUnit = createReactUnit(renderReturnReactElement)
    return this._renderReturnReactUnit.create(react_id)
  }
}
