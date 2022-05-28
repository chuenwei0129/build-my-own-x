// React 元素
// 是 html 的抽象 js 对象，声明式的
class ReactElement {
  constructor(type, props) {
    this.type = type
    this.props = props
  }
}

// 用户调用时执行生成 React 元素
function createReactElement(type, props, ...childReactElements) {
  // 递归生成 React 元素
  // childReactElements 里是子 createReactElement 函数的返回结果
  // props 传 null 时，为 {}
  props = props ?? {}
  props.children = childReactElements ?? []
  return new ReactElement(type, props)
}

export { ReactElement, createReactElement }
