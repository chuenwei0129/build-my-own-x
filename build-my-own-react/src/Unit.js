// 抽象类
// reactUnit 处理逻辑，输入 jsx 输出 created DOM 和 updated DOM
export class Unit {
  constructor(reactElement) {
    // 缓存传入的 jsx 元素，每个 reactUnit 都保存有其对应的 jsx 元素，更新时 jsx diff 可以找到对应的 jsx 元素
    this._currentReactElement = reactElement
  }
  // 子类都必须实现
  create() {
    throw Error('首次渲染的 dom 字串')
  }
}
