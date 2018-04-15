```
types
  string
    pattern
    minLength
    maxLength
    format
      date-time https://tools.ietf.org/html/rfc3339#section-5.6
      email https://tools.ietf.org/html/rfc5322#section-3.4.1
      hostname
      ipv4
      ipv6
      uri
  integer
    multipleOf
    minimum
    exclusiveMinimum
    maximum
    exclusiveMaximum
  number
    multipleOf
    minimum
    exclusiveMinimum
    maximum
    exclusiveMaximum
  object
    properties (Record<string, Schema>)
    required (string[])
    additionalProperties (bool | Schema, default true)
    minProperties
    maxProperties
    dependencies
    patternProperties (Record<RegExp, Schema>)
  array
    items (Schema, list)
    items (Schema[], tuple)
    additionalItems (tuple)
    minItems
    maxItems
    uniqueItems
  boolean
  null
  enum
combining
  allOf (Schema[])
  anyOf (Schema[])
  oneOf (Schema[])
  not (Schema)
```
