// js 后缀需要添加否则会 404
import ReactDOM from '../src/react-dom.js'
import React from '../src/react.js'

// jsx 编译为 React.createElement(...)
// createElement 返回值为 reactElement

// 1.0 渲染文本或数字
// const text = 'hello creact'
// ReactDOM.render(text, document.getElementById('root'))

// 2.0 渲染 DOM 元素
// const element = React.createElement(
//   'div',
//   {
//     className: 'test',
//     id: 'test',
//     style: {
//       backgroundColor: '#ccc',
//       color: 'yellow',
//     },
//     onClick: () => alert('hello world'),
//   },
//   React.createElement(
//     'b',
//     {
//       style: {
//         color: 'blue',
//       },
//     },
//     'JavaScript'
//   ),
//   ' is turning 25!'
// )
// ReactDOM.render(element, document.getElementById('root'))

// 3.0 渲染组件
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
//     const h1 = React.createElement(
//       'h1',
//       { style: { color: 'yellow' } },
//       this.props.name
//     )

//     const counter = React.createElement(
//       'div',
//       { style: { color: 'red' } },
//       this.state.count
//     )

//     const btn = React.createElement(
//       'button',
//       { onClick: this.handleClick },
//       ' + '
//     )

//     return React.createElement(
//       'div',
//       { style: { backgroundColor: 'grey' } },
//       h1,
//       counter,
//       btn
//     )
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

// ReactDOM.render(
//   React.createElement(CounterBox),
//   document.getElementById('root')
// )

// 4.0 更新文本
// class Counter extends React.Component {
//   constructor(props) {
//     super(props)

//     this.state = { count: 1 }
//   }

//   componentDidMount() {
//     setInterval(() => {
//       this.setState({ count: this.state.count + 1 })
//     }, 1000)
//   }

//   render() {
//     return this.state.count
//   }
// }

// ReactDOM.render(React.createElement(Counter), document.getElementById('root'))

// 5.0 dom 元素属性及文本更新
// class Counter extends React.Component {
//   constructor(props) {
//     super(props)

//     this.state = { count: 1 }
//   }

//   handleClick = () => {
//     this.setState({ count: this.state.count + 1 })
//   }

//   render() {
//     const h1 = React.createElement(
//       'h1',
//       { style: { color: 'yellow' } },
//       '计数器'
//     )

//     const counter = React.createElement(
//       'p',
//       { style: { color: (this.state.count & 1) === 0 ? 'red' : 'blue' } },
//       this.state.count
//     )

//     const btn = React.createElement(
//       'button',
//       { onClick: this.handleClick },
//       ' + '
//     )

//     return React.createElement(
//       'div',
//       {
//         style: {
//           backgroundColor: (this.state.count & 1) === 0 ? 'green' : 'grey',
//         },
//       },
//       h1,
//       counter,
//       btn
//     )
//   }
// }

// ReactDOM.render(React.createElement(Counter), document.getElementById('root'))

// 6.0 更新组件
class Counter extends React.Component {
  constructor(props) {
    super(props)

    this.state = { flag: true }
  }

  componentDidMount() {
    setInterval(() => {
      this.setState({ flag: !this.state.flag })
    }, 2000)
  }

  render() {
    const list1 = React.createElement(
      'ul',
      null,
      React.createElement('li', { key: 'A', style: { color: 'yellow' } }, 'A'),
      React.createElement('li', { key: 'B' }, 'B'),
      React.createElement('li', { key: 'C' }, 'C'),
      React.createElement('li', { key: 'D' }, 'D')
    )

    const list2 = React.createElement(
      'ul',
      null,
      React.createElement('li', { key: 'A', style: { color: 'blue' } }, 'A1'),
      React.createElement('li', { key: 'C' }, 'C1'),
      React.createElement('li', { key: 'B' }, 'B'),
      React.createElement('li', { key: 'E' }, 'E1'),
      React.createElement('li', { key: 'F' }, 'F1')
    )

    return this.state.flag ? list1 : list2
  }
}

ReactDOM.render(React.createElement(Counter), document.getElementById('root'))
