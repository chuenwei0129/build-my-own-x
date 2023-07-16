// 虚拟 DOM
class ReactElement {
  constructor(type, props) {
    this.type = type
    this.props = props
  }
}

// create 虚拟 DOM
function createReactElement(type, props, ...childReactElements) {
  // props 可以为 null
  props = props ?? {}
  props.children = childReactElements ?? []
  return new ReactElement(type, props)
}

export { ReactElement, createReactElement }
