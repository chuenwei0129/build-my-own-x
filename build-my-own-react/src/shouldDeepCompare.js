import { ReactElement } from './createElement.js'

// vnode 同级比较
export function shouldDeepCompare(oldEReactlement, newReactElement) {
  if (oldEReactlement != null || newReactElement != null) {
    if (
      (typeof oldEReactlement === 'string' ||
        typeof oldEReactlement === 'number') &&
      (typeof newReactElement === 'string' ||
        typeof newReactElement === 'number')
    ) {
      return true
    } else if (
      oldEReactlement instanceof ReactElement &&
      newReactElement instanceof ReactElement
    ) {
      return oldEReactlement.type === newReactElement.type
    }
  }
}
