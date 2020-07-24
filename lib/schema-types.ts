import * as Opts from './opts'
import * as J from './json-types'

type TOrArr<T> = T[] | T

type FlatSchema =
  | StrSchema
  | EnumSchema
  | RecSchema
  | DictSchema
  | ListSchema
  | TupleSchema
  | FormatSchema
  | BoolSchema
  | NullSchema
  | AnySchema

type CompSchema = AllOfSchema | AnyOfSchema | OneOfSchema | NotSchema

export type Schema = FlatSchema | CompSchema

const minIntFromFloat = (min: number, excl?: boolean) =>
  excl && Number.isInteger(min) ? min + 1 : Math.ceil(min)

const maxIntFromFloat = (max: number, excl?: boolean) =>
  excl && Number.isInteger(max) ? max - 1 : Math.floor(max)

const isPrimitiveLike = (x: unknown): x is J.PrimitiveLike =>
  J.isNullLike(x) ||
  J.isBooleanLike(x) ||
  J.isNumberLike(x) ||
  J.isStringLike(x)

function isMemberTag(x: unknown): x is MemberTag {
  return (
    x && (x as MemberTag).tag === 'member' && isSchema((x as MemberTag).schema)
  )
}

export function isSchema(x: unknown): x is Schema {
  if (!x) return false
  if (typeof x !== 'object' || Array.isArray(x)) return false
  if (typeof (x as any).type === 'string') return true
  const keys = Object.keys(x!)

  if (keys.length === 1) {
    switch (keys[0]) {
      case 'not':
        return isSchema((x as NotSchema).not)
      case 'allOf':
      case 'anyOf':
      case 'oneOf':
        return isSchemaArr((x as any)[keys[0]])
      case 'enum':
        return isPrimitiveArr((x as EnumSchema).enum)
    }
  }

  return keys.length === 0 // ANY schema
}

function isPrimitiveArr(x: unknown): x is J.PrimitiveLike[] {
  return Array.isArray(x) && x.every(isPrimitiveLike)
}

function isSchemaArr(x: unknown): x is Schema[] {
  return Array.isArray(x) && x.every(isSchema)
}

export interface StrSchema {
  type: 'string'
  minLength?: number
  maxLength?: number
}

export function Str(optsStr?: string): StrSchema {
  const schema: any = { type: 'string' }
  const opts = Opts.parse(optsStr)
  const len = opts.find(Opts.range('len')) || opts.find(Opts.range('length'))

  if (len && len.min != null)
    schema.minLength = minIntFromFloat(len.min, len.exclusiveMin)

  if (len && len.max != null)
    schema.maxLength = maxIntFromFloat(len.max, len.exclusiveMax)

  return schema
}

type MinInfo = { minimum: number } | { exclusiveMinimum: number }
type MaxInfo = { maximum: number } | { exclusiveMaximum: number }
type MultInfo = { multipleOf: number }
type NumSchema = Partial<MinInfo & MaxInfo & MultInfo>

function num(optsStr?: string): NumSchema {
  const opts = Opts.parse(optsStr)
  const range = opts.find(Opts.range('x'))
  const mult = opts.find(Opts.mult('n'))

  return {
    ...(range && range.min != null
      ? { [range.exclusiveMin ? 'exclusiveMinimum' : 'minimum']: range.min }
      : null),
    ...(range && range.max != null
      ? { [range.exclusiveMax ? 'exclusiveMaximum' : 'maximum']: range.max }
      : null),
    ...(mult && { multipleOf: mult.multiplier }),
  }
}

type IntSchema = NumSchema & { type: 'integer' }
export function Int(optsStr?: string): IntSchema {
  const schema = num(optsStr) as IntSchema
  schema.type = 'integer'
  return schema
}

type FloatSchema = NumSchema & { type: 'number' }
export function Float(optsStr?: string): FloatSchema {
  const schema = num(optsStr) as FloatSchema
  schema.type = 'number'
  return schema
}

export interface MemberTag {
  tag: 'member'
  required?: boolean
  schema: Schema
}

const reqCall = `${req.name}(schema)`
export function req(schema: Schema): MemberTag {
  if (isSchema(schema)) {
    return { tag: 'member', required: true, schema }
  }
  throw Error(reqCall + ': schema should be a schema')
}

const optCall = `${opt.name}(schema)`
export function opt(schema: Schema): MemberTag {
  if (isSchema(schema)) {
    return { tag: 'member', schema }
  }
  throw Error(optCall + ': schema should be a schema')
}

export interface RecSchema {
  type: 'object'
  properties: { [prop: string]: Schema }
  required: string[]
  additionalProperties: false
}

const RecordCall = `${Record.name}(members)`
export function Record(members: { [x: string]: MemberTag }): RecSchema {
  if (!members || typeof members !== 'object' || Array.isArray(members)) {
    throw Error(RecordCall + ': `members` should be an object')
  }

  const keys = Object.keys(members)
  if (!keys.every((key) => isMemberTag(members[key]))) {
    const advice = `Use \`${req.name}\` or \`${opt.name}\` helpers`
    throw Error(RecordCall + `: Some members are not tagged. ${advice}`)
  }

  return {
    type: 'object',
    properties: keys.reduce<{ [k: string]: Schema }>((acc, key) => {
      acc[key] = members[key].schema
      return acc
    }, {}),
    required: keys.filter((key) => members[key].required),
    additionalProperties: false,
  }
}

export interface DictSchema {
  type: 'object'
  additionalProperties: Schema
  minItems?: number
  maxItems?: number
}

const DictCall = `${Dict.name}(opts?, schema)`
export function Dict(itemsSchema: Schema): DictSchema
export function Dict(optsStr: string, itemsSchema: Schema): DictSchema
export function Dict(arg0: string | Schema, arg1?: Schema): DictSchema {
  const optsStr = arguments.length === 1 ? '' : (arg0 as string)
  const itemsSchema = arguments.length === 1 ? (arg0 as Schema) : arg1!

  if (!Opts.isOptsStr(optsStr) || !isSchema(itemsSchema))
    throw Error(DictCall + ': `schema` should be a schema')

  const schema: any = { type: 'object', additionalProperties: itemsSchema }
  const opts = Opts.parse(optsStr)
  const size =
    opts.find(Opts.range('size')) ||
    opts.find(Opts.range('len')) ||
    opts.find(Opts.range('length'))

  if (size && size.min != null)
    schema.minItems = minIntFromFloat(size.min, size.exclusiveMin)

  if (size && size.max != null)
    schema.maxItems = maxIntFromFloat(size.max, size.exclusiveMax)

  return schema
}

export interface ListSchema {
  type: 'array'
  items: Schema
  minItems?: number
  maxItems?: number
  uniqueItems?: boolean
}

const ListCall = `${List.name}(opts?, itemsSchema)`
export function List(itemsSchema: Schema): ListSchema
export function List(optsStr: string, itemsSchema: Schema): ListSchema
export function List(
  optsStr: string | Schema,
  itemsSchema?: Schema,
): ListSchema {
  let argc = arguments.length

  if (!Opts.isOptsStr(optsStr)) {
    itemsSchema = optsStr
    optsStr = ''
    argc++
  }

  if (isSchemaArr(itemsSchema) || argc > 2)
    throw Error(
      ListCall +
        `: \`itemsSchema\` should be a schema. Did you mean ${TupleCall}?`,
    )

  const schema: any = { type: 'array' }
  const opts = Opts.parse(optsStr as string)
  const len =
    opts.find(Opts.range('size')) ||
    opts.find(Opts.range('len')) ||
    opts.find(Opts.range('length'))
  const uniq = opts.find(Opts.uniq())

  if (itemsSchema) schema.items = itemsSchema

  if (len && len.min != null)
    schema.minItems = minIntFromFloat(len.min, len.exclusiveMin)

  if (len && len.max != null)
    schema.maxItems = maxIntFromFloat(len.max, len.exclusiveMax)

  if (uniq) schema.uniqueItems = true

  return schema
}

function flatten<T>(arr: TOrArr<T>[]): T[] {
  const ret: T[] = []
  for (let i = 0; i < arr.length; i++) {
    const elem = arr[i]
    if (Array.isArray(elem)) ret.push(...elem)
    else ret.push(elem)
  }
  return ret
}

function toSchemaList(
  schemas: TOrArr<Schema>[],
  callExample: string,
): Schema[] {
  const ret: Schema[] = flatten(schemas)

  for (let i = 0; i < ret.length; i++) {
    if (!isSchema(ret[i])) {
      throw Error(
        `${callExample}: \`schemaN\` should be a schema or array of schemas`,
      )
    }
  }

  return ret
}

export interface TupleSchema {
  type: 'array'
  items: Schema[]
  minItems: number
  maxItems: number
  additionalItems: false
}

const TupleCall = `${Tuple.name}(member0, member1, ...)`
export function Tuple(...arg: TOrArr<MemberTag>[]): TupleSchema {
  const members: MemberTag[] = flatten(arg)

  if (!members.every(isMemberTag)) {
    const advice = `Use \`${req.name}\` or \`${opt.name}\` helpers`
    throw Error(
      TupleCall + `: every \`member\` should be a tagged schema. ${advice}`,
    )
  }

  const required: Schema[] = []
  const optional: Schema[] = []

  for (let i = members.length - 1; i >= 0; i--) {
    const mem = members[i]
    if (mem.required) {
      required.unshift(mem.schema)
    } else if (required.length) {
      required.unshift(OneOf(mem.schema, NULL))
    } else {
      optional.unshift(mem.schema)
    }
  }

  return {
    type: 'array',
    items: required.concat(optional),
    minItems: required.length,
    maxItems: required.length + optional.length,
    additionalItems: false,
  }
}

export interface EnumSchema {
  enum: J.PrimitiveLike[]
}

const EnumCall = `${Enum.name}(...items)`
export function Enum(...arg: TOrArr<J.PrimitiveLike>[]): EnumSchema {
  const items: J.PrimitiveLike[] = flatten(arg)
  if (!items.length) {
    throw Error(EnumCall + ': `opts` should be nonempty')
  }
  if (!items.every(isPrimitiveLike)) {
    throw Error(EnumCall + ': `opts` should contain only primitives')
  }
  if (new Set(items).size !== items.length)
    throw Error(EnumCall + ': `opts` should be unique')
  return { enum: items }
}

export interface AllOfSchema {
  allOf: Schema[]
}

const AllOfCall = `${AllOf.name}(schema0, schema1, ...)`
export function AllOf(...schemas: TOrArr<Schema>[]): AllOfSchema {
  return {
    allOf: toSchemaList(schemas, AllOfCall),
  }
}

export interface AnyOfSchema {
  anyOf: Schema[]
}

const AnyOfCall = `${AnyOf.name}(schema0, schema1, ...)`
export function AnyOf(...schemas: TOrArr<Schema>[]): AnyOfSchema {
  return {
    anyOf: toSchemaList(schemas, AnyOfCall),
  }
}

export interface OneOfSchema {
  oneOf: Schema[]
}

const OneOfCall = `${OneOf.name}(schema0, schema1, ...)`
export function OneOf(...schemas: TOrArr<Schema>[]): OneOfSchema {
  return {
    oneOf: toSchemaList(schemas, OneOfCall),
  }
}

export interface NotSchema {
  not: Schema
}

const NotCall = `${Not.name}(schema)`
export function Not(schema: any): NotSchema {
  if (isSchema(schema)) return { not: schema }
  throw Error(NotCall + '`schema` should be a schema')
}

export interface AnySchema {}
export interface NullSchema {
  type: 'null'
}
export interface BoolSchema {
  type: 'boolean'
}
export interface FormatSchema {
  type: 'string'
  format: string
}

export const ANY: AnySchema = {}
export const NULL: NullSchema = { type: 'null' }
export const BOOL: BoolSchema = { type: 'boolean' }
export const DATE: FormatSchema = { type: 'string', format: 'date' }
export const TIME: FormatSchema = { type: 'string', format: 'time' }
export const DATE_TIME: FormatSchema = { type: 'string', format: 'date-time' }
export const URI: FormatSchema = { type: 'string', format: 'uri' }
export const URI_REFERENCE: FormatSchema = {
  type: 'string',
  format: 'uri-reference',
}
export const URI_TEMPLATE: FormatSchema = {
  type: 'string',
  format: 'uri-template',
}
export const URL: FormatSchema = { type: 'string', format: 'url' }
export const EMAIL: FormatSchema = { type: 'string', format: 'email' }
export const HOSTNAME: FormatSchema = { type: 'string', format: 'hostname' }
export const IPV4: FormatSchema = { type: 'string', format: 'ipv4' }
export const IPV6: FormatSchema = { type: 'string', format: 'ipv6' }
export const REGEX: FormatSchema = { type: 'string', format: 'regex' }
export const UUID: FormatSchema = { type: 'string', format: 'uuid' }
