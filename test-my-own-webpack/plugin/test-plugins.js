class StartCompilePlugin {
  apply(compiler) {
    // 在 compile 事件池中订阅 start 事件
    compiler.hooks.compile.tap('start compile', () => {
      console.log('开始编译 ...')
    })
  }
}

class CompileDonePlugin {
  apply(compiler) {
    compiler.hooks.done.tap('compile done', () => {
      console.log('结束编译 ...')
    })
  }
}

module.exports = {
  StartCompilePlugin,
  CompileDonePlugin
}
