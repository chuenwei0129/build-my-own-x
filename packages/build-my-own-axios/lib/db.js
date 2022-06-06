const Mock = require('mockjs')

// 自定义占位符
const Random = Mock.Random
Random.extend({
  animals() {
    // shuffle 打乱数组
    return this.shuffle(['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'])
  },
  hobby() {
    return this.pick(['抽烟', '喝酒', '烫头'])
  }
})

module.exports = () => {
  return Mock.mock({
    // 通过重复属性值 array 生成一个新数组，重复次数为 count。
    // 通过重复属性值 array 生成一个新数组，重复次数大于等于 min，小于等于 max。
    'users|10': [
      {
        // 属性值自动加 1，初始值为 number。
        // 生成一个大于等于 min、小于等于 max 的整数，属性值 number 只是用来确定类型。
        'id|+1': 1,

        // 通过重复 string 生成一个字符串，重复次数等于 count。
        // 通过重复 string 生成一个字符串，重复次数大于等于 min，小于等于 max。
        'slogan|3': 'go',

        // 随机生成一个布尔值，值为 value 的概率是 min / (min + max)，值为 !value 的概率是 max / (min + max)。
        // 1 ==> 1/2
        'is_happy|1-5': true,

        'sex|1': ['男', '女'],

        /** 占位符 */
        name: '@cname',
        // 从属性值 object 中随机选取 count 个属性。
        // 从属性值 object 中随机选取 min 到 max 个属性。
        address: {
          // 大区
          region: '@region',
          // 省
          province: '@city',
          // 市
          city: '@city(true)',
          // 县
          county: '@county(true)',
          // 街道：从属性值 array 中随机选取 1 个元素，作为最终值。
          'street|1': ['东路', '西路', '南路']
        },
        // 年龄
        'age|18-22': 1,
        // 身份证
        id_card: '@id',
        // 邮箱
        email: '@email(google.com)',
        // ip
        ip: '@ip',
        // 手机号
        phone: /^(13[0-9]|14[579]|15[0-3,5-9]|16[6]|17[0135678]|18[0-9]|19[89])\d{8}$/,
        // 指示生成的日期和时间字符串的格式。默认值为 yyyy-MM-dd HH:mm:ss。
        birthday: '@datetime("yyyy-MM-dd")',
        current_time: '@now',
        // text 规则类似 new Array
        word: '@cword()',
        sentence: '@csentence(3, 5)',
        paragraph: '@cparagraph(3, 7)',
        title: '@ctitle()',
        // image 背景 前景
        image: '@image(200x100, #4A7BF7, #fff, png, 人物)',
        animals: '@animals',
        'hobby|1': '@hobby'
      }
    ]
  })
}
