import { createFragmentInstance } from './createFragmentInstance.js'
import { shouldDeepCompare } from './shouldDeepCompare.js'
import { Fragment } from './Fragment.js'

export class ComponentFragment extends Fragment {
  create(react_id) {
    this._react_id = react_id
    // new ComponentFragment 时 type === Counter
    const { type: Component, props } = this._currentReactElement
    this._instanceComponent = new Component(props)
    // new Counter 时缓存 this，this 有 create 和 update 方法
    this._instanceComponent._connectedFragmentInstance = this

    // 执行 componentWillMount 钩子
    this._instanceComponent.componentWillMount &&
      this._instanceComponent.componentWillMount()

    // 监听 mounted 事件，注册 componentDidMount 回调
    document.addEventListener('mounted', () => {
      this._instanceComponent.componentDidMount &&
        this._instanceComponent.componentDidMount()
    })

    // 执行 Counter render
    const renderReturnedReactElement = this._instanceComponent.render()

    // 缓存 Counter render 返回的 jsx 对应的 fragment 实例
    this._renderReturnedFragmentInstance = createFragmentInstance(
      renderReturnedReactElement
    )

    return this._renderReturnedFragmentInstance.create(react_id)
  }

  // setState 触发 update 方法时，nextReactElement 为 null，即 react 更新的源头组件
  // 一旦 parent 触发重新渲染那么其 child 也必然跟着触发重新渲染，所以需要在 update 方法中把 nextReactElement 传递给子组件
  update(nextReactElement, nextState) {
    const prevProps = this._currentReactElement?.props
    let nextProps = nextReactElement?.props
    nextProps = nextProps ?? prevProps

    this._instanceComponent.state = {
      ...this._instanceComponent.state,
      ...nextState,
    }

    // componentWillUpdate 钩子
    this._instanceComponent.componentWillUpdate &&
      this._instanceComponent.componentWillUpdate()

    // shouldComponentUpdate 钩子
    if (
      this._instanceComponent.shouldComponentUpdate &&
      !this._instanceComponent.shouldComponentUpdate(nextProps, nextState)
    ) {
      return
    }

    // 再次执行 render，并且缓存新的 jsx
    this._nextRenderReturnedReactElement = this._instanceComponent.render()

    // 组件级 diff
    if (
      shouldDeepCompare(
        // 老的 jsx
        this._renderReturnedFragmentInstance._currentReactElement,
        // 新的 jsx
        this._nextRenderReturnedReactElement
      )
    ) {
      // 组件根 type 相同，往下递归找到不同的节点，进行更新
      this._renderReturnedFragmentInstance.update(
        this._nextRenderReturnedReactElement
      )
    } else {
      // 组件根 type 不同，直接替换
      document.querySelector(`[data-react_id="${this._react_id}"]`).outerHTML =
        createFragmentInstance(this._nextRenderReturnedReactElement).create(
          this._react_id
        )

      // 更新缓存
      this._renderReturnedFragmentInstance._currentReactElement =
        this._nextRenderReturnedReactElement
    }

    // componentDidUpdate 钩子
    this._instanceComponent.componentDidUpdate &&
      this._instanceComponent.componentDidUpdate()
  }
}
