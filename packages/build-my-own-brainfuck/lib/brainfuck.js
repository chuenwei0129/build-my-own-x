function brainLuck(code, input = '') {
  const inputChars = input.split('')

  const codes = code.split('')
  let codeIdx = 0

  const arr = []
  let arrIdx = 0
  let outputStr = ''

  while (codeIdx < code.length) {
    const ops = codes[codeIdx]

    const handleLeftBracket = () => {
      if (~~arr[arrIdx] === 0) {
        let cnt = 1

        while (cnt) {
          codeIdx++
          if (codes[codeIdx] === '[') {
            cnt += 1
          }
          if (codes[codeIdx] === ']') {
            cnt -= 1
          }
        }
      }
    }

    const handleRightBracket = () => {
      if (~~arr[arrIdx] !== 0) {
        let cnt = 1

        while (cnt) {
          codeIdx--
          if (codes[codeIdx] === ']') {
            cnt += 1
          }
          if (codes[codeIdx] === '[') {
            cnt -= 1
          }
        }
      }
    }

    switch (ops) {
      case '>':
        arrIdx += 1
        break
      case '<':
        arrIdx -= 1
        break
      case '+':
        arr[arrIdx] = (~~arr[arrIdx] + 1) % 256
        break
      case '-':
        arr[arrIdx] = (~~arr[arrIdx] || 256) - 1
        break
      case ',':
        const iptChar = inputChars.shift()
        arr[arrIdx] = iptChar ? iptChar.charCodeAt(0) : arr[arrIdx]
        break
      case '.':
        outputStr += String.fromCharCode(arr[arrIdx])
        break
      case '[':
        handleLeftBracket()
        break
      case ']':
        handleRightBracket()
        break
    }

    codeIdx++
  }

  return outputStr
}

const code = '>,[>,]<[.<]'
const input = 'Hello, world!'

const output = brainLuck(code, input)
console.log(output)

console.log(
  brainLuck(
    '++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.'
  )
)
