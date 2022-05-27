const path = require('path')
const { StartCompilePlugin, CompileDonePlugin } = require('./plugin/test-plugins')

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /.css$/,
        use: [
          path.resolve(__dirname, 'loader', 'style-loader'),
          path.resolve(__dirname, 'loader', 'css-loader')
        ]
      }
    ]
  },
  plugins: [new StartCompilePlugin(), new CompileDonePlugin()]
}
