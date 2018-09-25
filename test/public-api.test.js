const Lib = require('../');
const like = Lib.default;
const Ajv = require('ajv');
const draftv7 = require('ajv/lib/refs/json-schema-draft-07.json');
const { isRegistered } = require('../dist/register');

describe('public api', () => {
  const typeFactories = [
    like.Str.name,
    // Lib.Pattern.name,
    like.Int.name,
    like.Float.name,
    like.Record.name,
    like.Dict.name,
    like.List.name,
    like.Tuple.name,
    like.Enum.name,
    like.AllOf.name,
    like.AnyOf.name,
    like.OneOf.name,
    like.Not.name,
  ];

  const constantSchemas = [
    'ANY',
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

  const otherFns = [like.req.name, like.opt.name];

  typeFactories.concat(otherFns).forEach(name => {
    it(`should expose ${name} factory`, () => {
      expect(typeof like[name]).toBe('function');
      expect(Lib[name] === like[name]).toBe(true);
    });
  });

  constantSchemas.forEach(name => {
    it(`should expose ${name} constant schema`, () => {
      expect(typeof like[name]).toBe('object');
      expect(isRegistered(like[name])).toBe(true);
      expect(Lib[name] === like[name]).toBe(true);
    });
  });

  it(`should not expose anything else`, () => {
    const all = [].concat(typeFactories, constantSchemas, otherFns);
    for (const key in like) {
      expect(all).toContain(key);
    }
    for (const key in Lib) {
      if (key !== 'default') {
        expect(all).toContain(key);
      }
    }
  });
});

describe(`exposed function`, () => {
  it(`should allow nesting schemas in examples`, () => {
    const actual = like({
      foo: 'foo',
      bar: like({
        baz: [true, 2, like.Str('len >= 5')],
        some: 'prop1',
        other: new String('prop'),
        andSomeExplicitlySchemed: like.List(like(3)),
      }),
    });

    const expected = like.Record({
      foo: like.req(like.Str()),
      bar: like.req(
        like.Record({
          baz: like.req(
            like.Tuple(
              [like.BOOL, like.Int(), like.Str('len >= 5')].map(like.req)
            )
          ),
          some: like.req(like.Str()),
          other: like.req(like.Str()),
          andSomeExplicitlySchemed: like.req(like.List(like.Int())),
        })
      ),
    });

    expect(actual).toEqual(expected);
  });

  const isValid = new Ajv({ format: 'full' }).compile(draftv7);

  it(`should generate valid schema`, () => {
    expect(isValid(like.Str('1 < len < 321'))).toBe(true);
    expect(isValid(like.Int('1 < x < 23, 3.2n'))).toBe(true);
    expect(isValid(like.Float('1 <= x < 2, 0.1n'))).toBe(true);
    expect(isValid(like.Record({ foo: like.req(like.BOOL) }))).toBe(true);
    expect(isValid(like.Dict('23 < len <= 32', like.BOOL))).toBe(true);
    expect(isValid(like.List('uniq, 2 < len < 3', like.BOOL))).toBe(true);
    expect(isValid(like.Tuple(like.req(like.BOOL), like.req(like.NULL)))).toBe(
      true
    );
    expect(isValid(like.Enum(true, false, 1, 2))).toBe(true);
    expect(isValid(like.AllOf([like.BOOL, like.NULL]))).toBe(true);
    expect(isValid(like.AnyOf([like.BOOL, like.NULL]))).toBe(true);
    expect(isValid(like.OneOf([like.BOOL, like.NULL]))).toBe(true);
    expect(isValid(like.Not(like.BOOL))).toBe(true);
  });
});
