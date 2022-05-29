import { TextUnit } from './TextUnit.js'

// 工厂模式
export function createReactUnit(reactElement) {
  // 判断 reactElement 的类型

  // 对应如：ReactDOM.render('hello world', document.getElementById('root'))
  if (typeof reactElement === 'string' || typeof reactElement === 'number') {
    return new TextUnit(reactElement)
  }
}
