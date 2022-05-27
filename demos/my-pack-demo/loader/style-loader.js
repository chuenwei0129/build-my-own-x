module.exports = function loader(source) {
  // 返回可以被 eval 执行的代码
  return `
    let style = document.createElement('style');
    style.innerHTML = ${JSON.stringify(source)}
    document.head.appendChild(style)
  `
}
