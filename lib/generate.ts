import * as J from './json-types'
import * as T from './schema-types'
import { isRegistered, isTagged } from './register'

const DATE_TIME_LIKE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
const URL_LIKE = /^[a-z][a-z0-9+.-]*:/
const EMAIL_LIKE = /^.{1,30}@.{1,20}\..{1,4}$/
const IPV4_LIKE = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/
const IPV6_LIKE = /^(?:[0-9a-f]{0,4}:){2,7}(?:[0-9a-f]{1,4}$)$/i
const UUID_LIKE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function sthLike(example: unknown): T.Schema {
  if (isRegistered(example)) return example

  if (J.isNullLike(example)) return T.NULL
  if (J.isBooleanLike(example)) return T.BOOL
  if (J.isNumberLike(example)) {
    if (Number.isInteger(+example)) return T.Int()
    return T.Float()
  }
  if (J.isStringLike(example)) {
    if (DATE_TIME_LIKE.test('' + example)) return T.DATE_TIME
    if (URL_LIKE.test('' + example)) return T.URL
    if (EMAIL_LIKE.test('' + example)) return T.EMAIL
    if (IPV4_LIKE.test('' + example)) return T.IPV4
    if (IPV6_LIKE.test('' + example)) return T.IPV6
    if (UUID_LIKE.test('' + example)) return T.UUID
    return T.Str()
  }
  if (J.isObjectLike(example)) {
    const props = Object.keys(example).reduce<{ [k: string]: T.MemberTag }>(
      (acc, name) => {
        const val = example[name]
        acc[name] = isTagged(val) ? val : T.req(sthLike(val))
        return acc
      },
      {}
    )

    return T.Record(props)
  }
  if (J.isArrayLike(example)) {
    return T.Tuple(
      Array.from(example).map(ex => {
        return isTagged(ex) ? ex : T.req(sthLike(ex))
      })
    )
  }

  throw TypeError(
    `${sthLike.name}(example): don't know how to create schema for ${example}`
  )
}
