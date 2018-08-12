import * as Lib from '../lib';
import draftv7 from 'ajv/lib/refs/json-schema-draft-07.json';
import { isRegistered } from '../lib/register';

describe('public api', () => {
  const typeFactories = [
    Lib.Str.name,
    // Lib.Pattern.name,
    Lib.Int.name,
    Lib.Float.name,
    Lib.Record.name,
    Lib.Dict.name,
    Lib.List.name,
    Lib.Tuple.name,
    Lib.Enum.name,
    Lib.AllOf.name,
    Lib.AnyOf.name,
    Lib.OneOf.name,
    Lib.Not.name,
  ];

  const constantSchemas = [
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

  constantSchemas.forEach(name => {
    it(`should expose ${name} constant schema`, () => {
      expect(typeof Lib[name]).toBe('object');
      expect(isRegistered(Lib[name])).toBe(true);
    });
  });

  it(`should not expose anything else`, () => {
    const all = [].concat(typeFactories, constantSchemas, otherFns);
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
        baz: [true, 2, Lib.Str('len >= 5')],
        some: 'prop1',
        other: new String('prop'),
        andSomeExplicitlySchemed: Lib.List(Lib.sthLike(3)),
      },
    });

    const expected = Lib.Record({
      foo: Lib.Str(),
      bar: Lib.Record({
        baz: Lib.Tuple(Lib.BOOL, Lib.Int(), Lib.Str('len >= 5')),
        some: Lib.Str(),
        other: Lib.Str(),
        andSomeExplicitlySchemed: Lib.List(Lib.Int()),
      }),
    });

    expect(actual).toEqual(expected);
  });

  const isValid = Lib.predicateFor(draftv7);

  it(`should generate valid schema`, () => {
    expect(isValid(Lib.Str('1 < len < 321'))).toBe(true);
    expect(isValid(Lib.Int('1 < x < 23, 3.2n'))).toBe(true);
    expect(isValid(Lib.Float('1 <= x < 2, 0.1n'))).toBe(true);
    expect(isValid(Lib.Record({ foo: Lib.BOOL }))).toBe(true);
    expect(isValid(Lib.Dict('23 < len <= 32', Lib.BOOL))).toBe(true);
    expect(isValid(Lib.List('uniq, 2 < len < 3', Lib.BOOL))).toBe(true);
    expect(isValid(Lib.Tuple(Lib.BOOL, Lib.NULL))).toBe(true);
    expect(isValid(Lib.Enum(true, false, 1, 2))).toBe(true);
    expect(isValid(Lib.AllOf([Lib.BOOL, Lib.NULL]))).toBe(true);
    expect(isValid(Lib.AnyOf([Lib.BOOL, Lib.NULL]))).toBe(true);
    expect(isValid(Lib.OneOf([Lib.BOOL, Lib.NULL]))).toBe(true);
    expect(isValid(Lib.Not(Lib.BOOL))).toBe(true);
  });
});
