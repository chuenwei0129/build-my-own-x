// js 后缀需要添加否则会 404
import ReactDOM from '../../packages/build-my-own-react/lib/creact-dom.js'
import React from '../../packages/build-my-own-react/lib/creact.js'

// jsx 编译为 React.createElement()
// render 接受 React.createElement() 为参数，React 元素可以是 文本、DOM 元素、组件
// 组件是返回文本或者 DOM 元素的函数

// 文本
// ReactDOM.render('hello world', document.getElementById('root'))

// DOM 元素
// const DomElement = React.createElement(
//   'div',
//   {
//     className: 'class_test',
//     id: 'test',
//     onClick: () => alert('hello world'),
//     style: {
//       backgroundColor: '#ccc',
//       color: 'red'
//     }
//   },
//   React.createElement('b', null, 'JavaScript'),
//   ' is turning 25!'
// )

// ReactDOM.render(DomElement, document.getElementById('root'))

class Counter extends React.Component {
  constructor(props) {
    super(props)

    this.state = { count: 1 }
    // this.state = { flag: true }
  }
  handleClick = () => {
    alert('hello world')
    // this.setState({ count: this.state.count + 1 })
  }
  componentWillMount() {
    console.log('componentWillMount run')
  }
  componentDidMount() {
    console.log('componentDidMount run')
    // setInterval(() => {
    //   this.setState({ flag: !this.state.flag })
    // }, 2000)
  }
  // shouldComponentUpdate(nextProps, nextState) {
  //   // console.log('shouldComponentUpdate', nextProps)
  //   return true
  // }
  render() {
    console.log('render run')

    const h1 = React.createElement('h1', { style: { color: 'yellow' } }, this.props.name)

    const counter = React.createElement(
      'p',
      { style: { color: (this.state.count & 1) === 0 ? 'red' : 'blue' } },
      this.state.count
    )
    const btn = React.createElement('button', { onClick: this.handleClick }, ' + ')

    // 根 div 元素的 react_id 为 '0'
    return React.createElement(
      'div',
      { style: { backgroundColor: (this.state.count & 1) === 0 ? 'green' : 'grey' } },
      h1,
      counter,
      btn
    )
    // return this.state.count
    // const list1 = React.createElement(
    //   'ul',
    //   null,
    //   React.createElement('li', { key: 'A' }, 'A'),
    //   React.createElement('li', { key: 'B' }, 'B'),
    //   React.createElement('li', { key: 'C' }, 'C'),
    //   React.createElement('li', { key: 'D' }, 'D')
    // )
    // const list2 = React.createElement(
    //   'ul',
    //   null,
    //   React.createElement('span', { key: 'A' }, 'A1'),
    //   React.createElement('li', { key: 'C' }, 'C1'),
    //   React.createElement('li', { key: 'B' }, 'B1'),
    //   React.createElement('li', { key: 'E' }, 'E1'),
    //   React.createElement('li', { key: 'F' }, 'F1')
    // )
    // return this.state.flag ? list1 : list2
  }
  // componentWillUpdate() {
  // 	console.log('componentWillUpdate')
  // }
  // componentDidUpdate() {
  // 	console.log('componentDidUpdate')
  // }
}

ReactDOM.render(React.createElement(Counter, { name: '计数器' }), document.getElementById('root'))

// ---------------------------------------------------------------
// babel 做的事 jsx 转换
// {/* <div style={{ color: 'red' }} className="test" onClick={() => console.log('hello wrold')}>
// 	<b>JavaScript</b> is turning 25,and we're celebrating with free courses, expert-led live streams, and other fun surprises.
// </div> */}

/* #__PURE__ */
// React.createElement("div", {
//   style: {
//     color: 'red'
//   },
//   className: "test",
//   onClick: () => console.log('hello world')
// }, /*#__PURE__*/React.createElement("b", null, "JavaScript"), " is turning 25,and we're celebrating with free courses, expert-led live streams, and other fun surprises.");

// const element = React.createElement('div', {
// 	className: 'class_test',
// 	id: 'test',
// 	onClick: () => alert('hello world'),
// 	style: {
// 		backgroundColor: '#ccc',
// 		color: 'red'
// 	}
// }, React.createElement('b', null, 'JavaScript'), ' is turning 25,and we\'re celebrating with free courses, expert-led live streams, and other fun surprises.')

// console.log('react元素', element)

// ReactDOM.render(element,
// 	document.getElementById('root'))

// ---------------------------------------------------------------
