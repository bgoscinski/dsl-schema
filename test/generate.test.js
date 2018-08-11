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

  const primitives = [
    ['null', null, T.NULL],
    ['undefined', undefined, T.NULL],
    ['true', true, T.BOOL],
    ['false', false, T.BOOL],
    ['NaN', NaN, T.float()],
    ['0', 0, T.int()],
    ['-1.1', -1.1, T.float()],
    ['213', 213, T.int()],
    ['empty string', '', T.str()],
    ['string', 'foo', T.str()],
  ];

  primitives.forEach(([name, val, expected]) => {
    it(`given an example ${name} should return valid schema`, () => {
      expect(G.sthLike(val)).toEqual(expected);
    });
  });
});
