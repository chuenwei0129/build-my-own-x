import { ReactElement } from './creactElement.js'
import { DomElementUnit } from './DomElementUnit.js'
import { TextUnit } from './TextUnit.js'

// 工厂模式
export function createReactUnit(reactElement) {
  // console.log('render 输入的 react 元素: ', reactElement)

  // 判断 reactElement 的类型
  // 对应：ReactDOM.render('hello world', document.getElementById('root'))
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return new TextUnit(reactElement)
  }

  // 对应：React.createElement('div', {}, 'hello world')
  if (reactElement instanceof ReactElement && typeof reactElement.type === 'string') {
    return new DomElementUnit(reactElement)
  }
  if (reactElement instanceof Element && typeof reactElement.type === 'function') {
    return new ComponentUnit(reactElement)
  }
}
