import { ReactElement } from './creactElement.js'

// jsx 同级比较
export function shouldDeepCompare(oldElement, newElement) {
  if (oldElement != null || newElement != null) {
    if (
      (typeof oldElement === 'string' || typeof oldElement === 'number') &&
      (typeof newElement === 'string' || typeof newElement === 'number')
    ) {
      return true
    } else if (oldElement instanceof ReactElement && newElement instanceof ReactElement) {
      return oldElement.type === newElement.type
    }
  }
}
