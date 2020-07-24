const like = require('../').default
const G = require('../dist/generate')

describe(G.sthLike.name, () => {
  it('given an example object should return a record schema', () => {
    const actual = G.sthLike({ foo: 3, asd: null })
    const expected = like.Record({
      foo: like.req(like.Int()),
      asd: like.req(like.NULL),
    })
    expect(actual).toEqual(expected)
  })

  it('given an example array should return a tuple schema', () => {
    const actual = G.sthLike([1, 2.3, 'foo', true, null])
    const expected = like.Tuple(
      [like.Int(), like.Float(), like.Str(), like.BOOL, like.NULL].map(
        like.req,
      ),
    )
    expect(actual).toEqual(expected)
  })

  it('should allow to put tagged schemas in example records', () => {
    const actual = G.sthLike({
      opt: like.opt(like.ANY),
      req: like.req(like.ANY),
      norm: 'norm',
    })

    const expected = like.Record({
      opt: like.opt(like.ANY),
      req: like.req(like.ANY),
      norm: like.req(like.Str()),
    })

    expect(actual).toEqual(expected)
  })

  it('should allow to put tagged schemas in example tuples', () => {
    const actual = G.sthLike([
      1,
      like.opt(like(true)),
      'str',
      like.req(like.IPV4),
    ])

    const expected = like.Tuple([
      like.req(like.Int()),
      like.opt(like.BOOL),
      like.req(like.Str()),
      like.req(like.IPV4),
    ])

    expect(actual).toEqual(expected)
  })

  it('should prefer object-like to array-like examples', () => {
    const actual = G.sthLike({
      foo: 3,
      length: 13,
    })

    const expected = like.Record({
      foo: like.req(like.Int()),
      length: like.req(like.Int()),
    })

    expect(actual).toEqual(expected)
  })

  it.each`
    name                    | val                                          | schema
    ${'null'}               | ${null}                                      | ${like.NULL}
    ${'undefined'}          | ${undefined}                                 | ${like.NULL}
    ${'true'}               | ${true}                                      | ${like.BOOL}
    ${'false'}              | ${false}                                     | ${like.BOOL}
    ${'NaN'}                | ${NaN}                                       | ${like.Float()}
    ${'0'}                  | ${0}                                         | ${like.Int()}
    ${'-1.1'}               | ${-1.1}                                      | ${like.Float()}
    ${'213'}                | ${213}                                       | ${like.Int()}
    ${'empty string'}       | ${''}                                        | ${like.Str()}
    ${'string'}             | ${'foo'}                                     | ${like.Str()}
    ${'date-time'}          | ${new Date().toISOString()}                  | ${like.DATE_TIME}
    ${'URL'}                | ${'http://xx.xx/abc-d/e?123&x=3'}            | ${like.URL}
    ${'e-mail without TLD'} | ${'asd@example'}                             | ${like.Str()}
    ${'e-mail with TLD'}    | ${'asd@example.com'}                         | ${like.EMAIL}
    ${'IPv4'}               | ${'1.1.1.1'}                                 | ${like.IPV4}
    ${'IPv6'}               | ${'2001:0db8:0000:0000:0000:ff00:0042:8329'} | ${like.IPV6}
    ${'UUID'}               | ${'123e4567-e89b-12d3-a456-426655440000'}    | ${like.UUID}
  `('should return valid schema for $name', ({ val, schema }) => {
    expect(G.sthLike(val)).toEqual(schema)
  })
})
