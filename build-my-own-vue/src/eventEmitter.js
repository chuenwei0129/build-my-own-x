// 发布订阅模式
// 支持先发布后订阅

class EventEmitter {
  constructor() {
    this.eventPools = []
    this.caches = {}
  }

  on(eventName, eventFn) {
    if (eventName in this.caches) {
      eventFn(...this.caches[eventName])
    } else {
      this.eventPools.push({ [eventName]: eventFn })
    }
  }

  emit(eventName, ...args) {
    this.eventPools.forEach(event => {
      if (event[eventName]) {
        event[eventName](...args)
      } else {
        this.caches[eventName] = [...args]
      }
    })
  }

  off(eventName) {
    for (const [idx, event] of this.eventPools.entries()) {
      if (event.hasOwnProperty(eventName)) {
        this.eventPools.splice(idx, 1)
      }
    }
  }

  once(eventName, eventFn) {
    const eventFnOnce = (...args) => {
      eventFn(...args)
      this.off(eventName)
    }
    this.on(eventName, eventFnOnce)
  }
}
