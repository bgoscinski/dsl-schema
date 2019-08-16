const { toString } = Object.prototype

export type NullLike = null | undefined
export type BoolLike = boolean | Boolean
export type NumberLike = number | Number
export type StringLike = string | String
export type ArrayLike<T> = globalThis.ArrayLike<T>
export type ObjectLike = { [k: string]: unknown }

export type PrimitiveLike = NullLike | BoolLike | NumberLike | StringLike

export function isNullLike(x: unknown): x is NullLike {
  return x == null
}

export function isBooleanLike(x: unknown): x is BoolLike {
  return x === true || x === false || toString.call(x) === '[object Boolean]'
}

export function isNumberLike(x: unknown): x is NumberLike {
  return typeof x === 'number' || toString.call(x) === '[object Number]'
}

export function isStringLike(x: unknown): x is StringLike {
  return typeof x === 'string' || toString.call(x) === '[object String]'
}

export function isArrayLike(x: unknown): x is ArrayLike<unknown> {
  return (
    x != null &&
    (Array.isArray(x) ||
      (typeof x === 'object' &&
        isNumberLike((x as any).length) &&
        !isStringLike(x)))
  )
}

export function isObjectLike(x: unknown): x is ObjectLike {
  return x != null && toString.call(x) === '[object Object]'
}
