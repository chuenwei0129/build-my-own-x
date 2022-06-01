// 一对多
// 一个被观察者对象，可以被多个观察者对象观察

// 观察者
class Observer {
  update() {
    console.log('被观察者更新了')
  }
}

// 被观察者
class Subject {
  constructor() {
    this.observers = []
  }

  addObserver(observer) {
    this.observers.push(observer)
  }

  removeObserver(observer) {
    this.observers = this.observers.filter(item => item !== observer)
  }

  notify() {
    this.observers.forEach(observer => observer.update())
  }
}
