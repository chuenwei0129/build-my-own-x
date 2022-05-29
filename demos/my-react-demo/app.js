// js 后缀需要添加否则会 404 无法测试
import ReactDOM from '../../packages/build-my-own-react-15/lib/creact-dom.js'
import React from '../../packages/build-my-own-react-15/lib/creact.js'

// jsx 编译为 React.createElement('div', {className: 'box'}, 'hello world')
// createElement 返回值为 reactElement
// render 接受 reactElement 为参数，React 元素可以是文本节点、原生 DOM 元素（包含属性，文本，子元素）、组件（返回值为 原生 DOM 元素或文本节点）

// DOM 元素
const DomElement = React.createElement(
  'div',
  {
    className: 'box',
    id: 'box',
    onClick: () => alert('hello world'),
    style: {
      backgroundColor: '#ccc',
      color: 'yellow'
    }
  },
  React.createElement(
    'b',
    {
      style: {
        color: 'blue'
      }
    },
    'JavaScript'
  ),
  ' is turning 25!'
)

ReactDOM.render(DomElement, document.getElementById('root'))
