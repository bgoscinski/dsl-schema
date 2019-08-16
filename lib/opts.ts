export type Opt = MultOpt | RangeOpt | UniqOpt

export const isOptsStr = (x: unknown): x is string => typeof x === 'string'

export interface UniqOpt {
  type: 'uniq'
}

function tryParseUniq(str: string): UniqOpt | undefined {
  if (str === 'uniq' || str === 'unique') {
    return { type: 'uniq' }
  }
}

export const uniq = () => (opt: Opt): opt is UniqOpt => opt.type === 'uniq'

type Ord = '<=' | '<' | '>' | '>='
type MinBoundary = { min: number; exclusiveMin?: true }
type MaxBoundary = { max: number; exclusiveMax?: true }
type Boundary = MinBoundary | MaxBoundary

const getLeftBoundary = ([op, incl]: Ord, val: number): Boundary => {
  if (op === '<') {
    return incl ? { min: val } : { min: val, exclusiveMin: true }
  } else {
    return incl ? { max: val } : { max: val, exclusiveMax: true }
  }
}

const getRightBoundary = ([op, incl]: Ord, val: number): Boundary => {
  if (op === '>') {
    return incl ? { min: val } : { min: val, exclusiveMin: true }
  } else {
    return incl ? { max: val } : { max: val, exclusiveMax: true }
  }
}

//                       | lhs   |   | lop  |     | bind |      | rop  |   | rhs   |
const RANGE_REGEX = /^(?:([\d\.]+)\s*([<>]=?)\s*)?([a-z]+)(?:\s*([<>]=?)\s*([\d\.]+))?$/i

export interface RangeOpt {
  type: 'range'
  binding: string
  min?: number
  exclusiveMin?: boolean
  max?: number
  exclusiveMax?: boolean
}

function tryParseRangeOpt(str: string): RangeOpt | undefined {
  const match = str.trim().match(RANGE_REGEX)

  if (!match) return
  const [, lhs, lop, binding, rop, rhs] = match
  if (!lop && !rop) return
  if (lop && rop && lop.charAt(0) !== rop.charAt(0)) return

  return {
    type: 'range',
    binding,
    ...(lop && getLeftBoundary(lop as Ord, parseFloat(lhs))),
    ...(rop && getRightBoundary(rop as Ord, parseFloat(rhs)))
  }
}

export const range = (binding: string) => (opt: Opt): opt is RangeOpt =>
  opt.type === 'range' && opt.binding === binding

//                      | lhs   |          | bind |           | rhs   |
const MULT_REGEX = /^(?:([\d\.]+)\s*\*\s*)?([a-z]+)(?:\s*\*\s*([\d\.]+))?$/i

export interface MultOpt {
  type: 'mult'
  binding: string
  multiplier: number
}

function tryParseMult(str: string): MultOpt | undefined {
  const match = str.trim().match(MULT_REGEX)

  if (!match) return
  const [, lhs, binding, rhs] = match
  if (lhs && rhs) return
  if (!lhs && !rhs) return

  return { type: 'mult', binding, multiplier: parseFloat(lhs || rhs) }
}

export const mult = (binding: string) => (opt: Opt): opt is MultOpt =>
  opt.type === 'mult' && opt.binding === binding

export function parse(spec: string | undefined): Opt[] {
  if (!spec) return []
  return spec.split(/\s*,\s*/).reduce<Opt[]>((acc, part) => {
    const parsed =
      tryParseUniq(part) || tryParseRangeOpt(part) || tryParseMult(part)
    return parsed ? [...acc, parsed] : acc
  }, [])
}
