// 抽象类
// 每个 react 单元都会缓存当前渲染时传入的 reactElement 本身，用于更新
export class Unit {
  constructor(reactElement) {
    this._currentReactElement = reactElement
  }
  // 子类必须实现
  create() {
    throw Error('创建渲染的 dom 节点字符串')
  }
}
