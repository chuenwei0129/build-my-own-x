# `build-my-own-brainfuck`

## 前置知识：Typescript

> [TypeScript 类型体操实战技巧](ts.md)

## BrainFuck

> 🌿 基础知识：[什么是图灵完备？](https://www.zhihu.com/question/20115374)

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

## BF 解释器的 JS 函数实现

**💊 辅助理解：** 一个 Brainfuck 可视化网站：[Brainfuck Visualizer](https://brainfuck-visualizer.herokuapp.com) —— 可以 `run` 一下看看解释器执行的动态过程。

**代码奉上：**

```js
const brainFuck = (code, input) => {
  // brainfuck 的计算模型官方说法格子数目限制为 3000
  const memo = Array.from({ length: 3000 }, () => 0)
  const opts = code.split('')
  const chars = input?.split('')

  // 如果当前指针指向的数据带值为 0，则跳到与之匹配的 ']'
  const loopStart = () => {
    // 不满足条件什么都不做
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

  let memoIdx = 0
  let codeIdx = 0
  let output = ''

  while (codeIdx < opts.length) {
    // memo 格子溢出处理
    if (memoIdx > 3000) {
      throw new Error('range error')
    }

    switch (opts[codeIdx]) {
      case '>':
        memoIdx++
        break
      case '<':
        memoIdx--
        break
      case '+':
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
      default:
        break
    }

    codeIdx++
  }

  return output
}
```

**测试代码：** 反转字符串

```js
console.log(brainFuck('>,[>,]<[.<]', 'Hello World!'))
```

## BF 解释器的 TS 实现

### 动机

众所周知，TypeScript 拥有一个[图灵完备的类型系统](https://github.com/microsoft/TypeScript/issues/14833)

> **BrainFuck 有一个用处**：一门新语言功能语法很复杂，要用数学证明的方式确定性说明它图灵完备会很麻烦，但只要用这门新语言实现一个 brainfuck的解释器，那么就必然证明了是图灵完备的

### 实现

> TODO

标记一下：'[' 处字符串该传的是完整的字符串，得处理，input 也得处理，老用参数闭包保存变量有点 low 需要换个方式缕一缕。一些 edge  case 也得考虑，先写点别的，换个脑子。

[代码](./lib/BrainFuck.ts)

### 资料

- [TypeScript 类型体操天花板，用类型运算写一个 Lisp 解释器](https://zhuanlan.zhihu.com/p/427309936)
- [TypeScript 类型元编程：实现8位数的算术运算](https://zhuanlan.zhihu.com/p/85655537)
- [Type-level Brainfuck interpreter in TypeScript](https://github.com/susisu/typefuck)
