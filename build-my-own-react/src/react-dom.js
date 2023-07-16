import { createFragmentInstance } from './createFragmentInstance.js'

const root_react_id = '0'
// 注册 mounted 事件
const event = new Event('mounted')

function render(reactElement, container) {
  const fragmentInstance = createFragmentInstance(reactElement)
  const fragment = fragmentInstance.create(root_react_id)
  // 挂载 fragment 到 container
  container.innerHTML = fragment
  // 挂载 dom 完毕触发 mounted 事件
  document.dispatchEvent(event)
}

export default { render }
