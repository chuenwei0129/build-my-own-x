import { createReactUnit } from './creactUnit.js'

const root_react_id = '0'

// 注册自定义 mounted 事件
const event = new Event('mounted')

// 渲染流程 jsx => react 单元 => dom string => dom

function render(reactElement, container) {
  // 创建对应的 react 单元（三种）
  const reactUnit = createReactUnit(reactElement)

  // 调用对应的 react 单元的 create 方法生成对应的 dom 字串，并添加 react_id 标记
  // 形如：`<span data-react_id="0">${element}</span>`
  const reactDomString = reactUnit.create(root_react_id)

  // 挂载、这里用 innerHTML 模拟
  container.innerHTML = reactDomString

  // 挂载 dom 完毕触发 mounted 事件
  document.dispatchEvent(event)
}

export default { render }
