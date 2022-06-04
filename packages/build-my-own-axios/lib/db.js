const Mock = require('mockjs')

module.exports = () => {
  return Mock.mock({
    'course|10': [
      {
        // 属性 id 是一个自增数，起始值为 1，每次增 1
        'id|+1': 1000,
        course_name: '@ctitle(5,10)',
        author: '@cname',
        college: '@ctitle(6)',
        'category_Id|1-6': 1
      }
    ],
    'course_category|6': [
      {
        'id|+1': 1,
        pid: -1,
        cName: '@ctitle(4)'
      }
    ]
  })
}
