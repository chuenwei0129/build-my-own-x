namespace BF {
  type ArrayOf<
    Len extends number,
    Arr extends unknown[] = [],
    Item extends number = 0
  > = Arr['length'] extends Len ? Arr : ArrayOf<Len, [...Arr, Item], Item>

  type Add<N1 extends number, N2 extends number> = [...ArrayOf<N1>, ...ArrayOf<N2>]['length']

  type Sub<N1 extends number, N2 extends number> = ArrayOf<N1> extends [
    ...ArrayOf<N2>,
    ...infer Rest
  ]
    ? Rest['length']
    : never

  type Gte<N1 extends number, N2 extends number, Cnt extends unknown[] = []> = N1 extends N2
    ? true
    : Cnt['length'] extends N2
    ? true
    : Cnt['length'] extends N1
    ? false
    : Gte<N1, N2, [...Cnt, unknown]>

  type Mod<N1 extends number, N2 extends number, Cnt extends unknown[] = []> = N2 extends 0
    ? never
    : Gte<N1, N2> extends false
    ? N1
    : N1 extends 0
    ? 0
    : Mod<Sub<N1, N2>, N2, [...Cnt, unknown]>

  // position 从 0 开始，模拟数组 index
  type SetMemo<Memo extends unknown[], Position extends number, Val> = Memo extends [
    ...infer Rest,
    infer Last
  ]
    ? Memo['length'] extends Add<Position, 1>
      ? [...Rest, Val]
      : [...SetMemo<Rest, Position, Val>, Last]
    : []

  type GetItem<Memo extends unknown[], Position extends number> = Memo extends [
    ...infer Rest,
    infer Last
  ]
    ? Memo['length'] extends Add<Position, 1>
      ? Last
      : GetItem<Rest, Position>
    : never
  // 是 never 还是 []，看返回的类型

  type LeftSkip<Code> = Code extends `${infer H}${infer R}`
    ? H extends '['
      ? `${H}${R}`
      : LeftSkip<R>
    : never

  type RightSkip<Code> = Code extends `${infer H}${infer R}`
    ? H extends ']'
      ? `${H}${R}`
      : RightSkip<R>
    : never

  // I 指针
  // TODO: 减法完善，溢出处理
  type BrainFuck<
    Code,
    Memo = ArrayOf<5>,
    I extends number = 0,
    S extends string = ''
  > = Code extends `${infer H}${infer R}`
    ? H extends `+`
      ? // @ts-ignore 参数默认值问题？
        BrainFuck<R, SetMemo<Memo, I, Add<GetItem<Memo, I>, 1>>, I, `${S}${H}`>
      : H extends `-`
      ? // @ts-ignore
        BrainFuck<R, SetMemo<Memo, I, Sub<GetItem<Memo, I>, 1>>, I, `${S}${H}`>
      : H extends `>`
      ? // @ts-ignore
        BrainFuck<R, Memo, Add<I, 1>, `${S}${H}`>
      : H extends `<`
      ? // @ts-ignore
        BrainFuck<R, Memo, Sub<I, 1>, `${S}${H}`>
      : H extends `[`
      ? // @ts-ignore
        GetItem<Memo, I> extends 0
        ? BrainFuck<RightSkip<``>, Memo, I, `${S}${H}`>
        : BrainFuck<R, Memo, I, `${S}${H}`>
      : H extends `]`
      ? // @ts-ignore
        GetItem<Memo, I> extends 0
        ? BrainFuck<R, Memo, I, `${S}${H}`>
        : BrainFuck<LeftSkip<`${S}${H}`>, Memo, I, ''>
      : H extends `,`
      ? // @ts-ignore
        0
      : H extends `.`
      ? // TODO: Ascii code 码表
        '1'
      : never
    : Memo

  type Code = '+++++[>++<-]'
  type Output = BrainFuck<Code>

  // 测试代码
  // type Code = '>,[>,]<[.<]'
  // type Input = 'Hello, world!'
  // type Output = BrainFuck<Code, Input>
}
