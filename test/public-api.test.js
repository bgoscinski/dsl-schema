import * as Lib from '../lib';
import draftv7 from 'ajv/lib/refs/json-schema-draft-07.json';

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
    'BOOL',
    'NULL',
    'DATE',
    'TIME',
    'DATE_TIME',
    'URI',
    'URI_REFERENCE',
    'URI_TEMPLATE',
    'URL',
    'EMAIL',
    'HOSTNAME',
    'IPV4',
    'IPV6',
    'REGEX',
    'UUID',
  ];

  const otherFns = [
    Lib.sthLike.name,
    Lib.validatorFor.name,
    Lib.predicateFor.name,
    Lib.assertFor.name,
  ];

  typeFactories.concat(otherFns).forEach(name => {
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
    const all = [].concat(typeFactories, constants, otherFns);
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
        baz: Lib.tuple(Lib.BOOL, Lib.int(), Lib.str('len >= 5')),
        some: Lib.str(),
        other: Lib.str(),
        andSomeExplicitlySchemed: Lib.list(Lib.int()),
      }),
    });

    expect(actual).toEqual(expected);
  });

  const isValid = Lib.predicateFor(draftv7);

  it(`should generate valid schema`, () => {
    expect(isValid(Lib.str('1 < len < 321'))).toBe(true);
    expect(isValid(Lib.int('1 < x < 23, 3.2n'))).toBe(true);
    expect(isValid(Lib.float('1 <= x < 2, 0.1n'))).toBe(true);
    expect(isValid(Lib.record({ foo: Lib.BOOL }))).toBe(true);
    expect(isValid(Lib.dict('23 < len <= 32', Lib.BOOL))).toBe(true);
    expect(isValid(Lib.list('uniq, 2 < len < 3', Lib.BOOL))).toBe(true);
    expect(isValid(Lib.tuple(Lib.BOOL, Lib.NULL))).toBe(true);
    expect(isValid(Lib.allOf([Lib.BOOL, Lib.NULL]))).toBe(true);
    expect(isValid(Lib.anyOf([Lib.BOOL, Lib.NULL]))).toBe(true);
    expect(isValid(Lib.oneOf([Lib.BOOL, Lib.NULL]))).toBe(true);
    expect(isValid(Lib.not(Lib.BOOL))).toBe(true);
  });
});
