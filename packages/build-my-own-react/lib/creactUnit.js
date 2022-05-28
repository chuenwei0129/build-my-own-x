import { TextUnit } from './TextUnit.js'

// 工厂模式
export function createReactUnit(reactElement) {
  // 对应：ReactDOM.render('hello world', document.getElementById('root'))
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return new TextUnit(reactElement)
  }
  if (reactElement instanceof Element && typeof reactElement.type === 'string') {
    return new NativeUnit(reactElement)
  }
  if (reactElement instanceof Element && typeof reactElement.type === 'function') {
    return new ComponentUnit(reactElement)
  }
}
