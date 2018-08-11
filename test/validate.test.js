import { assertFor } from '../lib/validate';
import { sthLike } from '../lib/generate';

describe(assertFor.name, () => {
  const assert = assertFor(
    sthLike({
      a: 1,
      b: {
        c: 3,
        d: [4, 5],
      },
    })
  );

  it(`should not throw when data matches schema`, () => {
    expect(() =>
      assert({
        a: 6,
        b: {
          c: 7,
          d: [8, 9],
        },
      })
    ).not.toThrow();
  });

  it(`should throw when data doesn't match schema [1]`, () => {
    expect(() => assert()).toThrowErrorMatchingSnapshot();
  });

  it(`should throw when data doesn't match schema [2]`, () => {
    expect(() =>
      assert({ a: '', b: { d: [''] } })
    ).toThrowErrorMatchingSnapshot();
  });
});
