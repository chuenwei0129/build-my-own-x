import { ReactElement } from './creactElement.js'
import { createReactUnit } from './creactUnit.js'
import { Unit } from './Unit.js'

// diff 优化，是否是脏组件，即 type 不同的组件直接替换
function shouldDeepCompare(oldElement, newElement) {
  if (oldElement != null || newElement != null) {
    if (
      (typeof oldElement === 'string' || typeof oldElement === 'number') &&
      (typeof newElement === 'string' || typeof newElement === 'number')
    ) {
      return true
    } else if (oldElement instanceof ReactElement && newElement instanceof ReactElement) {
      return oldElement.type === newElement.type
    }
  }
}

export class ComponentUnit extends Unit {
  create(react_id) {
    this._react_id = react_id
    const { type: Component, props } = this._currentReactElement

    // 实例化用户定义的 React.Component，注入写在其标签上的 props，并把组件实例挂到 unit 实例上
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

  update(nextReactElement, nextState) {
    // nextReactElement 是需要更新的 reactElement
    // 是否复用 reactElement 上的 props 属性
    // 旧的
    const prevProps = this._currentReactElement?.props
    // 新的
    let nextProps = nextReactElement?.props
    nextProps = nextProps ?? prevProps

    // state 在创建时是用户传入的，更新时是用户调用 setState 方法时传入的
    // 更新状态
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

    // 获取状态改变后的 react 元素
    this._nextRenderReturnReactElement = this._instanceComponent.render()

    // 新老 react 元素对比
    if (
      shouldDeepCompare(
        // 缓存的老的状态
        this._renderReturnReactUnit._currentReactElement,
        // 新的状态
        this._nextRenderReturnReactElement
      )
    ) {
      // type 相同，对应节点单元传入新的状态
      // 递归执行最终递归到文本单元
      this._renderReturnReactUnit.update(this._nextRenderReturnReactElement)
    } else {
      // type 不同，直接创建新的节点并插入dom
      document.querySelector(`[data-reactid="${this._reactid}"]`).innerHTML = createReactUnit(
        this._nextReactElement
      ).create(this._reactid)
    }
    this._instanceComponent.componentDidUpdate && this._instanceComponent.componentDidUpdate()
  }
}
