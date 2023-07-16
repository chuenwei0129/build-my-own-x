import { ComponentFragment } from './ComponentFragment.js'
import { ReactElement } from './createElement.js'
import { ElementFragment } from './ElementFragment.js'
import { TextFragment } from './TextFragment.js'

// 工厂模式
export function createFragmentInstance(reactElement) {
  // 对应：ReactDOM.render('hello world', document.getElementById('root'))
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return new TextFragment(reactElement)
  }

  // 对应：React.createElement('div', {}, 'hello world')
  if (
    reactElement instanceof ReactElement &&
    typeof reactElement.type === 'string'
  ) {
    return new ElementFragment(reactElement)
  }

  // 对应：React.createElement(Counter, {}) type 为组件
  if (
    reactElement instanceof ReactElement &&
    typeof reactElement.type === 'function'
  ) {
    return new ComponentFragment(reactElement)
  }
}
