import * as T from '../lib/schema-types';
import * as G from '../lib/generate';

describe(G.sthLike.name, () => {
  it('given an example object should return a record schema', () => {
    const actual = G.sthLike({ foo: 3, asd: null });
    const expected = T.record({
      foo: T.int(),
      asd: T.NULL,
    });
    expect(actual).toEqual(expected);
  });

  it('given an example array should return a tuple schema', () => {
    const actual = G.sthLike([1, 2.3, 'foo', true, null]);
    const expected = T.tuple(T.int(), T.float(), T.str(), T.BOOL, T.NULL);
    expect(actual).toEqual(expected);
  });

  it.each`
    name                    | val                                          | schema
    ${'null'}               | ${null}                                      | ${T.NULL}
    ${'undefined'}          | ${undefined}                                 | ${T.NULL}
    ${'true'}               | ${true}                                      | ${T.BOOL}
    ${'false'}              | ${false}                                     | ${T.BOOL}
    ${'NaN'}                | ${NaN}                                       | ${T.float()}
    ${'0'}                  | ${0}                                         | ${T.int()}
    ${'-1.1'}               | ${-1.1}                                      | ${T.float()}
    ${'213'}                | ${213}                                       | ${T.int()}
    ${'empty string'}       | ${''}                                        | ${T.str()}
    ${'string'}             | ${'foo'}                                     | ${T.str()}
    ${'date-time'}          | ${new Date().toISOString()}                  | ${T.DATE_TIME}
    ${'URL'}                | ${'http://xx.xx/abc-d/e?123&x=3'}            | ${T.URL}
    ${'e-mail without TLD'} | ${'asd@example'}                             | ${T.str()}
    ${'e-mail with TLD'}    | ${'asd@example.com'}                         | ${T.EMAIL}
    ${'IPv4'}               | ${'1.1.1.1'}                                 | ${T.IPV4}
    ${'IPv6'}               | ${'2001:0db8:0000:0000:0000:ff00:0042:8329'} | ${T.IPV6}
    ${'UUID - nil'}         | ${'00000000-0000-0000-0000-000000000000'}    | ${T.UUID}
    ${'UUID'}               | ${'123e4567-e89b-12d3-a456-426655440000'}    | ${T.UUID}
  `('should return valid schema for $name', ({ val, schema }) => {
    expect(G.sthLike(val)).toEqual(schema);
  });
});
