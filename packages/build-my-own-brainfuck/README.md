# `build-my-own-brainfuck`

## 准备工作

BF 作为一种极简的计算机语言，仅有 8 种运算符，分别为: `<`、`>`、`+`、`-`、`,`、`.`、`[`、`]`，其功能对照如下表所示：

| 指令  |                                    含义                                     |
| :---: | :-------------------------------------------------------------------------: |
|  `<`  |                            指针减一（指针左移）                             |
|  `>`  |                            指针加一（指针右移）                             |
|  `+`  |                 指针指向的字节的值加一（当前单元的数值+1）                  |
|  `-`  |                 指针指向的字节的值减一（当前单元的数值-1）                  |
|  `,`  | 输入内容到指针指向的单元（输入一个字符，将其ASCII码保存到当前指针所指单元） |
|  `.`  |        将指针指向的存储单元的内容作为字符输出（将ASCII码输出为字符）        |
|  `[`  |           如果指针指向的存储单元为零，向后跳转到对应的 `]` 指令处           |
|  `]`  |          如果指针指向的存储单元不为零，向前跳转到对应的 `[` 指令处          |

[可视化](https://brainfuck-visualizer.herokuapp.com/#)

[什么是图灵完备？](https://www.zhihu.com/question/20115374)


```js
const brainFuck = (code, input) => {
  // 定长数据带
  const memo = Array.from({ length: 5 }, () => 0)
  const opts = code.split('')
  const chars = input?.split('')

  // 如果当前指针指向的数据带值为 0，则跳到与之匹配的 ']'
  const loopStart = () => {
    // 不满足条件 break
    if (~~memo[memoIdx] === 0) {
      let cnt = 1

      while (cnt) {
        codeIdx++
        // 嵌套
        if (opts[codeIdx] === '[') {
          cnt++
        }
        if (opts[codeIdx] === ']') {
          // 结束循环
          cnt--
        }
      }
    }
  }

  // 如果当前指针指向的数据带值不为 0，则跳到与之匹配的 '['
  const loopEnd = () => {
    if (~~memo[memoIdx] !== 0) {
      let cnt = 1

      while (cnt) {
        codeIdx--
        if (opts[codeIdx] === ']') {
          cnt++
        }
        if (opts[codeIdx] === '[') {
          cnt--
        }
      }
    }
  }

  // 数据存储指针
  let memoIdx = 0
  // 程序运行指针
  let codeIdx = 0
  let output = ''

  while (codeIdx < opts.length) {
    switch (opts[codeIdx]) {
      case '>':
        memoIdx++
        break
      case '<':
        memoIdx--
        break
      case '+':
        // TODO: memo 溢出处理
        // 假设 memo 无限长
        // ~~undefined === 0
        // 255 + 1 = 256 % 256 === 0
        memo[memoIdx] = (~~memo[memoIdx] + 1) % 256
        break
      case '-':
        // '-' : 0 || 256 = 255
        // '--': 255 - 1 = 254
        memo[memoIdx] = (~~memo[memoIdx] || 256) - 1
        break
      // 获取键盘输入的字节流，写入当前数据指针指向的数据带
      case ',':
        const iptChar = chars?.shift()
        // 'H'.codePointAt(0) === 72
        memo[memoIdx] = iptChar ? iptChar.codePointAt(0) : memo[memoIdx]
        break
      case '.':
        // 从 Unicode 码表中取出对应的字符
        output += String.fromCodePoint(memo[memoIdx])
        break
      case '[':
        loopStart()
        break
      case ']':
        loopEnd()
        break
    }

    codeIdx++
  }

  // console.log(memo)

  return output
}

console.log(brainFuck('+++')) // memo: [ 3, 0, 0, 0, 0 ]
console.log(brainFuck('--')) // memo: [ 254, 0, 0, 0, 0 ]
console.log(brainFuck(',.>,.>,.', 'CHU')) // 'CHU'
// 逻辑：'['(不满足条件) -> '>+++<-' -> ']' -> '[' -> '>+++<-' -> ']' -> '[' -> ']'(不满足条件)
// 循环套路，+++ 第一个格子存储的是循环次数，无计数 +，因为循环次数为 0，所以不会进入循环，无 '-'，无限循环 '+[>++]'
console.log(brainFuck('+++[>+++>+++++++>+++++<<<-].'))

// 'H' === 72
// 'e' === 101
// 'l' === 108
// 'l' === 108
// 'o' === 111
// 108 复用 101 格子

console.log(
  brainFuck(`
  ++++++++++
  [
  >+++++++
  >++++++++++
  <<-
  ]
  >++.
  >+.
  +++++++.
  .
  +++.
`)
) // 'Hello'
```

- <https://brainfuck-visualizer.herokuapp.com/>
- [TypeScript 类型体操天花板，用类型运算写一个 Lisp 解释器](https://zhuanlan.zhihu.com/p/427309936)
- <https://github.com/susisu/typefuck>
- <https://www.lilnong.top/static/html/booklet.html?id=7047524421182947366&sectionIdx=1>
- [[TypeScript奇技淫巧] union to tuple](https://zhuanlan.zhihu.com/p/58704376)

## 拾人牙慧

- [重新发明 Y 组合子 JavaScript(ES6) 版](http://picasso250.github.io/2015/03/31/reinvent-y.html)
- [Y不动点组合子用在哪里？](https://www.zhihu.com/question/21099081)
- [函数式编程的 Y Combinator 有哪些实用价值？](https://www.zhihu.com/question/20115649/answer/14029761)

- [递归思想为什么是编程的基本思想，它效率很高吗？](https://www.zhihu.com/question/271081962)
- [通用的递归转循环方法](https://zhuanlan.zhihu.com/p/136511316)
- [尾递归为啥能优化？](https://zhuanlan.zhihu.com/p/36587160)
- [写给小白的Monad指北](https://zhuanlan.zhihu.com/p/65449477)
- [学习函数式编程 Monad](https://zhuanlan.zhihu.com/p/306339035)
- [React 推荐函数组件是纯函数，但是组件有状态就不可能是纯函数，怎么理解有状态的纯函数？](https://www.zhihu.com/question/537538929)

<https://www.zhihu.com/question/345689944/answer/943385371>

<!-- 函数 + 参数 + 环境（闭包） => 返回值 + 环境（闭包）
 ↑    ↑    ↑
静态   动态   动态
其中，函数是可以静态编译的，哪怕是匿名函数那也只是匿名，而不是每次执行都要「重新生成」，重新生成的只有「环境（闭包）」，但是在外部环境执行的时候，这个闭包就已经生成了，并不会有多余的开销。

大概明白了，我想应该是这样的。每个函数都会创建一个自身环境，并且自身环境有个指针指向上级环境。而这上下级环境关系是由函数代码定义位置决定的。为了有动态环境(?) js才引入this的概念。 -->
