// js 后缀需要添加否则会 404 无法测试
import ReactDOM from '../../packages/build-my-own-react-15/lib/creact-dom.js'
import React from '../../packages/build-my-own-react-15/lib/creact.js'

// jsx 编译为 React.createElement('div', {className: 'box'}, 'hello world')
// createElement 返回值为 reactElement
// render 接受 reactElement 为参数，React 元素可以是文本节点、原生 DOM 元素（包含属性，文本，子元素）、组件（返回值为 原生 DOM 元素或文本节点）

/**
 * 渲染
 */

// 文本节点
// const text = 'hello world'

// DOM 元素
// const DomElement = React.createElement(
//   'div',
//   {
//     className: 'box',
//     id: 'box',
//     onClick: () => alert('hello world'),
//     style: {
//       backgroundColor: '#ccc',
//       color: 'yellow'
//     }
//   },
//   React.createElement(
//     'b',
//     {
//       style: {
//         color: 'blue'
//       }
//     },
//     'JavaScript'
//   ),
//   ' is turning 25!'
// )

// 组件
// class Counter extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = { count: 1 }
//   }

//   handleClick = () => {
//     alert('hello world')
//   }

//   componentWillMount() {
//     console.log('componentWillMount')
//   }

//   componentDidMount() {
//     console.log('componentDidMount')
//   }

//   render() {
//     const h1 = React.createElement('h1', { style: { color: 'yellow' } }, this.props.name)

//     const counter = React.createElement('div', { style: { color: 'red' } }, this.state.count)
//     const btn = React.createElement('button', { onClick: this.handleClick }, ' + ')

//     // 根 div 元素的 react_id 为 '0'
//     return React.createElement('div', { style: { backgroundColor: 'grey' } }, h1, counter, btn)
//   }
// }

// class CounterBox extends React.Component {
//   constructor(props) {
//     super(props)
//     this.state = { name: '计数器' }
//   }

//   render() {
//     return React.createElement(Counter, { name: this.state.name })
//   }
// }

/**
 * 更新
 */

// 文本节点
class Counter extends React.Component {
  constructor(props) {
    super(props)

    this.state = { count: 1 }
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ count: this.state.count + 1 })
    }, 1000)
  }

  render() {
    return this.state.count
  }
}

ReactDOM.render(React.createElement(Counter), document.getElementById('root'))
