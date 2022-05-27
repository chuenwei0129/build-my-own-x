module.exports = function loader(source) {
  return source.replace(/\n/g, '\\n')
}
