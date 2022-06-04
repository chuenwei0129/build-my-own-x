const Mock = require('mockjs')

module.exports = () => {
  return Mock.mock({
    'user_info|10': [
      {
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        // json-server 必须要有 id，才能新增
        'id|+1': 1,
        name: '@cname()'
      }
    ]
  })
}
