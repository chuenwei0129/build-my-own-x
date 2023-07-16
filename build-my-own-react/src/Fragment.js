// 抽象类
export class Fragment {
  constructor(reactElement) {
    // 缓存传入的 vdom，每个 fragment 都保存有其对应的 vdom 元素，更新时 diff vdom
    this._currentReactElement = reactElement
  }
  create() {
    throw Error('子类都必须实现 create 方法')
  }
}
