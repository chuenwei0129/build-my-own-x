// html tag 的抽象
// js 对象
// 声明式
class ReactElement {
  constructor(type, props) {
    this.type = type
    this.props = props
  }
}

function createReactElement(type, props, ...childReactElements) {
  // childReactElements 里是子 createReactElement 函数的返回结果
  // props 可以传 null
  props = props ?? {}
  props.children = childReactElements ?? []
  return new ReactElement(type, props)
}

export { ReactElement, createReactElement }
