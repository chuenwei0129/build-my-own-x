module.exports = function loader(source) {
  // 处理换行转义
  return source.replace(/\n/g, '\\n')
}
