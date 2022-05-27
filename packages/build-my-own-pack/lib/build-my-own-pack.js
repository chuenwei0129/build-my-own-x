#! /usr/bin/env node

const path = require('path')
const Compiler = require('./compiler')

// 通过 npm link 可以拿到 pack.config.js
const config = require(path.resolve('pack.config.js'))

const compiler = new Compiler(config)

// 开始编译
compiler.run()
