type MyPromiseState = 'pending' | 'fulfilled' | 'rejected'

type Resolve = (value: unknown) => void
type Reject = (reason?: any) => void

type Executor = (resolve: Resolve, reject: Reject) => void

type OnFulFilled = (value?: unknown) => unknown
type OnRejected = (reason?: any) => any

class MyPromise {
  private state: MyPromiseState = 'pending'
  private value: unknown = undefined
  private reason: any = undefined
  private fulFilledCallbacks: Set<() => void> = new Set()
  private rejectedCallbacks: Set<() => void> = new Set()

  constructor(executor: Executor) {
    const reject: Reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected'
        this.reason = reason
        this.rejectedCallbacks.forEach((callback) => callback())
      }
    }

    const resolve: Resolve = (value: unknown) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled'
        this.value = value
        this.fulFilledCallbacks.forEach((callback) => callback())
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      reject(error)
    }
  }

  then(
    onFulFilled: OnFulFilled = (value) => value,
    onRejected: OnRejected = (reason) => {
      throw reason
    }
  ) {
    if (this.state === 'fulfilled') {
      onFulFilled(this.value)
    }

    if (this.state === 'rejected') {
      onRejected(this.reason)
    }

    if (this.state === 'pending') {
      this.fulFilledCallbacks.add(() => {
        onFulFilled(this.value)
      })

      this.rejectedCallbacks.add(() => {
        onRejected(this.reason)
      })
    }
  }
}

export default MyPromise
