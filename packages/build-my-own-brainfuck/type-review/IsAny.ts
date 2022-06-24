// any 类型与任何类型的交叉都是 any
// 1 & unknown 结果是 1
type IsAny<T> = 2 extends T & 1 ? true : false

// true
export type Test = IsAny<any>
