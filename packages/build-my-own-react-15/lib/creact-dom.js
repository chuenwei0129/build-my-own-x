import { createReactUnit } from './creactUnit.js'

const root_react_id = '0'

// 注册自定义 mounted 事件
const event = new Event('mounted')

// 出于理解需要，把 reactElement 当作 jsx 看待
function render(reactElement, container) {
  const reactUnit = createReactUnit(reactElement)

  // 生成 dom 字串，并添加 react_id 标记
  const reactDomString = reactUnit.create(root_react_id)

  // 挂载
  container.innerHTML = reactDomString

  // 挂载 dom 完毕触发 mounted 事件
  document.dispatchEvent(event)
}

export default { render }
