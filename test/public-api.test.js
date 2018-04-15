import * as Lib from '../lib';

describe('public api', () => {
  const typeFactories = [
    Lib.str.name,
    // Lib.Pattern.name,
    Lib.int.name,
    Lib.float.name,
    Lib.record.name,
    Lib.dict.name,
    Lib.list.name,
    Lib.tuple.name,
    Lib.allOf.name,
    Lib.anyOf.name,
    Lib.oneOf.name,
    Lib.not.name,
  ];

  const constants = [
    'Bool',
    'Null',
    // 'DateTime',
    // 'Email',
    // 'Hostname',
    // 'Ipv4',
    // 'Ipv6',
    // 'Uri',
  ];

  const generators = [Lib.sthLike.name];

  typeFactories.concat(generators).forEach(name => {
    it(`should expose ${name} factory`, () => {
      expect(typeof Lib[name]).toBe('function');
    });
  });

  constants.forEach(name => {
    it(`should expose ${name} constant`, () => {
      expect(typeof Lib[name]).toBe('object');
    });
  });

  it(`should not expose anything else`, () => {
    const all = [].concat(typeFactories, constants, generators);
    for (const key in Lib) {
      expect(all).toContain(key);
    }
  });
});

describe(`exposed ${Lib.sthLike.name}`, () => {
  it(`should allow nesting schemas in examples`, () => {
    const actual = Lib.sthLike({
      foo: 'foo',
      bar: {
        baz: [true, 2, Lib.str('len >= 5')],
        some: 'prop1',
        other: new String('prop'),
        andSomeExplicitlySchemed: Lib.list(Lib.sthLike(3)),
      },
    });

    const expected = Lib.record({
      foo: Lib.str(),
      bar: Lib.record({
        baz: Lib.tuple(Lib.Bool, Lib.float(), Lib.str('len >= 5')),
        some: Lib.str(),
        other: Lib.str(),
        andSomeExplicitlySchemed: Lib.list(Lib.float()),
      }),
    });

    expect(actual).toEqual(expected);
  });
});
