type BrainFuck<Code, Input> = {}

// 字符串
type First<Str extends string> = Str extends `${infer First}${infer Rest}` ? First : never
type Rest<Str extends string> = Str extends `${infer First}${infer Rest}` ? Rest : never
type MergeStr<S1, S2> = S1 extends string ? (S2 extends string ? `${S1}${S2}` : never) : never

type Code = ',.'

// type Output = BrainFuck<Code, Input>

// 测试代码
// type Code = '>,[>,]<[.<]'
// type Input = 'Hello, world!'
// type Output = BrainFuck<Code, Input>
