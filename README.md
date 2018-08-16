# dsl-schema

> So I herd U liek `JSON Schema`!

`dsl-schema` provides simple, yet powerful API for building up your `JSON Schema`s based on examples you provide.

```js
import like from 'dsl-schema';

const mySchema = like({
  foo: 'some string',
  baz: ['yup'],
  // Can be nested for more fine-grained control!
  here: like.Enum('come dat boi', 'I come'),
});

// true
ajv.validate(mySchema, {
  foo: 'bar',
  baz: ['fizz buz'],
  here: 'I come',
});

// false
ajv.validate(mySchema, {
  not: 'valid',
});
```

## Getting started

```sh
npm install dsl-schema # OR
yarn add dsl-schema
```

```js
import like from 'dsl-schema';
const schema = like(1337);
```

## Docs

### `like`

```ts
like: (example: any) => Schema;
```

- For object like `example` it builds up a [`Record`](#likerecord) of its properties
- For array like `example` it builds up a [`Tuple`](#liketuple) of its elements
- For primitive `example` it tries to guess the best schema for it:
  - [`NULL`](#constant-schemas) for `null` and `undefined`
  - [`BOOL`](#constant-schemas) for `boolean`
  - [`Int`](#likeint) for `number` when it pass `Number.isInteger`
  - [`Float`](#likefloat) for `number` when it doesn't
  - one of the [Constants](#constant-schemas) with fallback to [`Str`](#likestr)
    for `string`. Decision is based on very loose `RegExp`s for ISO 8601
    date-time, URL, e-mail, IPv4, IPv6 and UUID

### `like.Str`

```ts
Str: (opts: string) => Schema;
```

Min and max length can be specified using `opts`

- `Str('10 > len')`
- `Str('3 < length')`
- `Str('3 < len <=10')`

### `like.Float`

```ts
Float: (opts: string) => Schema;
```

Min, max, and multipleOf can be specified using `opts`

- `Float('1.3 < x')`
- `Float('1.3 < x <= 6')`
- `Float('n*0.1')`
- `Float('1.3 < x <= 6, n*2.6')`

### `like.Int`

```ts
Int: (opts: string) => Schema;
```

See [`Float`](#likefloat)

### `like.req`

```ts
req: (s: Schema) => TaggedSchema;
```

Tags schema as required

### `like.opt`

```ts
req: (s: Schema) => TaggedSchema;
```

Tags schema as optional

### `like.Tuple`

```ts
Tuple: (...items: TaggedSchema[]) => Schema;
```

### `like.Record`

```ts
Record: (props: { [key: string]: TaggedSchema }) => Schema;
```

### `like.Dict`

```ts
Dict: (opts: string, itemsType: Schema) => Schema;
Dict: (itemsType: Schema) => Schema;
```

Size of the dictionary can be specified using `opts`

- `Dict('size <= 10')`
- `Dict('length > 10')`
- `Dict('30 > len > 10')`

### `like.List`

```ts
List: (opts: string, itemsType: Schema) => Schema;
List: (itemsType: Schema) => Schema;
```

See [`Dict`](#likedict). Can also specify uniqueness

- `List('unique')`
- `List('uniq, len < 30')`

### `like.Enum`

```ts
Enum: (...items: (null | boolean | number | string)[]) => Schema;
```

Elements of the `items` must be unique

### `like.AllOf`

```ts
AllOf: (...schemas: Schema[]) => Schema;
```

### `like.AnyOf`

```ts
AnyOf: (...schemas: Schema[]) => Schema;
```

### `like.OneOf`

```ts
OneOf: (...schemas: Schema[]) => Schema;
```

### `like.Not`

```ts
Not: (schema: Schema) => Schema;
```

### Constant schemas

- `ANY`
- `BOOL`
- `NULL`
- `DATE`
- `TIME`
- `DATE_TIME`
- `URI`
- `URI_REFERENCE`
- `URI_TEMPLATE`
- `URL`
- `EMAIL`
- `HOSTNAME`
- `IPV4`
- `IPV6`
- `REGEX`
- `UUID`
