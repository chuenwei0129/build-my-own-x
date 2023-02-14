const path = require('path')
const fs = require('fs')

const babelParser = require('@babel/parser')
// Babel Traverse（遍历）模块维护了整棵树的状态，并且负责替换、移除和添加节点。
const traverse = require('@babel/traverse').default
// Babel Types 模块是一个用于 AST 节点的 Lodash 式工具库
const t = require('@babel/types')
const generator = require('@babel/generator').default

const ejs = require('ejs')
const { SyncHook } = require('tapable')

class Compiler {
  constructor(config) {
    // config === pack.config.js
    this.config = config

    this.entryId = null
    this.modules = {}
    this.entry = config.entry
    // process.cwd() === c-pack 执行目录
    this.root = process.cwd()

    // 定义不同的生命周期事件池
    this.hooks = {
      compile: new SyncHook(['compile']),
      done: new SyncHook(['done']),
    }

    const plugins = this.config.plugins
    // 把 Compiler 实例注入插件
    if (Array.isArray(plugins)) {
      plugins.forEach((plugin) => {
        plugin.apply(this)
      })
    }
  }

  // 获取对应模块的代码
  getSource(modulePath) {
    let source = fs.readFileSync(modulePath, 'utf-8')
    // 拿到用户自定义规则 module.rules
    const rules = this.config.module.rules
    rules.forEach((rule) => {
      const { test, use } = rule
      // 根据 modulePath 来匹配规则是否需要 loader 处理
      if (test.test(modulePath)) {
        function normalLoader() {
          return use.length > 1
            ? use.reduceRight((pre, cur) => {
                return require(cur)(require(pre)(source))
              })
            : require(use[0])(source)
        }
        source = normalLoader()
      }
    })
    return source
  }

  parse(source, parentPath) {
    // 分析出依赖关系
    const ast = babelParser.parse(source)
    const dependencies = []
    // 遍历 ast
    traverse(ast, {
      CallExpression(p) {
        const node = p.node
        // 判断是否是 require 函数
        if (node.callee.name === 'require') {
          node.callee.name = '__webpack_require__'
          // 形如 './style.css'
          let moduleId = node.arguments[0].value
          moduleId = moduleId + (path.extname(moduleId) ? '' : '.js')
          moduleId = './' + path.join(parentPath, moduleId)
          // 将依赖模块的路径添加到 dependencies 数组中
          dependencies.push(moduleId)
          // 把依赖项的 require 替换成 我们定义的 __webpack_require__
          node.arguments = [t.stringLiteral(moduleId)]
        }
      },
    })

    const sourceCode = generator(ast).code
    return { sourceCode, dependencies }
  }

  buildModule(modulePath, isEntry) {
    const source = this.getSource(modulePath)

    // 以模块的相对路径做为模块 id
    const moduleId = './' + path.relative(this.root, modulePath)

    // 入口模块的 id 为 './src/index.js'
    if (isEntry) {
      // path.relative(/Users/.../my-pack-demo, /Users/.../my-pack-demo/src/index.js) === src/index.js
      // 不直接使用 this.entry，因为 this.entry 是用户的输入
      this.entryId = moduleId
    }

    // 第一次 path.dirname 返回目录 './src'
    // sourceCode 对应当前模块编译后的代码，依赖数组对应当前模块依赖的模块 dependencies: [ './src/style.css' ]
    const { sourceCode, dependencies } = this.parse(
      source,
      path.dirname(moduleId)
    )

    // 缓存源码和模块依赖关系
    this.modules[moduleId] = sourceCode

    // 递归处理依赖的模块
    dependencies.forEach((moduleId) => {
      this.buildModule(path.resolve(this.root, moduleId), false)
    })
  }

  emitFile() {
    // 把代码写入 ejs 模版
    // 输出路径和文件
    const bundle = path.join(
      this.config.output.path,
      this.config.output.filename
    )
    // 读取模版内容
    const templateStr = this.getSource(path.join(__dirname, 'template.ejs'))
    // 替换 ejs 变量
    const code = ejs.render(templateStr, {
      entryId: this.entryId,
      modules: this.modules,
    })
    this.assets = {}
    this.assets[bundle] = code
    // 把代码写入输出文件中
    fs.writeFileSync(bundle, this.assets[bundle])
  }

  run() {
    // 触发 compile 事件池的事件 start compile
    this.hooks.compile.call('start compile')

    // 递归编译模块
    this.buildModule(path.resolve(this.root, this.entry), true)

    // 触发 done 事件池的事件 compile done
    this.hooks.done.call('compile done')

    // 发射打包后的文件
    this.emitFile()
  }
}

module.exports = Compiler
