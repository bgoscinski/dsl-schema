import * as T from '../lib/schema-types';

describe(T.str.name, () => {
  it('should just work', () => {
    expect(T.str()).toEqual({ type: 'string' });
  });

  it('should allow to specify minLength and maxLength', () => {
    expect(T.str('1 < len <= 2')).toEqual({
      type: 'string',
      minLength: 2,
      maxLength: 2,
    });

    expect(T.str('1 <= len < 2')).toEqual({
      type: 'string',
      minLength: 1,
      maxLength: 1,
    });

    expect(T.str('1 <= len')).toEqual({
      type: 'string',
      minLength: 1,
    });

    expect(T.str('2 > len')).toEqual({
      type: 'string',
      maxLength: 1,
    });
  });
});

[[T.int, 'integer'], [T.float, 'number']].forEach(([factory, schemaType]) => {
  describe(factory.name, () => {
    it('should just work', () => {
      expect(factory()).toEqual({ type: schemaType });
    });

    it('should allow to specify multipleOf prop', () => {
      expect(factory('n * 3')).toEqual({
        type: schemaType,
        multipleOf: 3,
      });

      expect(factory('3*n')).toEqual({
        type: schemaType,
        multipleOf: 3,
      });

      expect(factory('1.3n')).toEqual({
        type: schemaType,
        multipleOf: 1.3,
      });
    });

    it('should allow to specify range', () => {
      expect(factory('1 < x < 5')).toEqual({
        type: schemaType,
        exclusiveMinimum: 1,
        exclusiveMaximum: 5,
      });

      expect(factory('1.1 <= x <= 5')).toEqual({
        type: schemaType,
        minimum: 1.1,
        maximum: 5,
      });

      expect(factory('5 > x > 1')).toEqual({
        type: schemaType,
        exclusiveMinimum: 1,
        exclusiveMaximum: 5,
      });

      expect(factory('5.6 >= x >= 1')).toEqual({
        type: schemaType,
        minimum: 1,
        maximum: 5.6,
      });

      expect(factory('5 < x')).toEqual({
        type: schemaType,
        exclusiveMinimum: 5,
      });

      expect(factory('5.78 >= x')).toEqual({
        type: schemaType,
        maximum: 5.78,
      });
    });

    it('should allow to specify range and multipleOf at the same time', () => {
      expect(factory('12n, x > 6')).toEqual({
        type: schemaType,
        exclusiveMinimum: 6,
        multipleOf: 12,
      });
    });
  });
});

describe(T.record.name, () => {
  it('should require properties schemas as an arg', () => {
    expect(() => T.record()).toThrow(
      /should be an object with schemas as values/
    );
    expect(() => T.record(1)).toThrow(
      /should be an object with schemas as values/
    );
  });

  it('should work', () => {
    expect(T.record({ foo: T.int(), someProp: T.Bool })).toEqual({
      type: 'object',
      properties: {
        foo: T.int(),
        someProp: T.Bool,
      },
      required: ['foo', 'someProp'],
      additionalProperties: false,
    });
  });
});

describe(T.dict.name, () => {
  it('should require item schema as an arg', () => {
    expect(() => T.dict()).toThrow(/should be a schema/);
    expect(() => T.dict(1)).toThrow(/should be a schema/);
  });

  it('should work', () => {
    expect(T.dict(T.Bool)).toEqual({
      type: 'object',
      additionalProperties: T.Bool,
    });
  });

  it('should allow to specify minItems and maxItems', () => {
    expect(T.dict('1 < len <= 77', T.Bool)).toEqual({
      type: 'object',
      additionalProperties: T.Bool,
      minItems: 2,
      maxItems: 77,
    });
  });
});

describe(T.list.name, () => {
  it('should just work', () => {
    expect(T.list()).toEqual({
      type: 'array',
    });
  });

  it('should allow to specify items schema', () => {
    expect(T.list(T.Bool)).toEqual({
      type: 'array',
      items: T.Bool,
    });
  });

  it(`should suggest ${T.tuple.name} when called with multiple schemas`, () => {
    expect(() => T.list(T.Bool, T.int())).toThrow(
      `Did you mean ${T.tuple.name}(schema0, schema1, ...)?`
    );

    expect(() => T.list([T.Bool, T.int()])).toThrow(
      `Did you mean ${T.tuple.name}(schema0, schema1, ...)?`
    );

    expect(() => T.list('uniq', T.Bool, T.int())).toThrow(
      `Did you mean ${T.tuple.name}(schema0, schema1, ...)?`
    );

    expect(() => T.list('uniq', [T.Bool, T.int()])).toThrow(
      `Did you mean ${T.tuple.name}(schema0, schema1, ...)?`
    );
  });

  it('should allow to specify minItems and maxItems', () => {
    expect(T.list('3 < len <= 23')).toEqual({
      type: 'array',
      minItems: 4,
      maxItems: 23,
    });
  });

  it('should allow to specify uniqueness', () => {
    expect(T.list('uniq')).toEqual({
      type: 'array',
      uniqueItems: true,
    });
  });

  it('should allow to specify all the things at the same time', () => {
    expect(T.list('uniq, len > 5', T.Bool)).toEqual({
      type: 'array',
      uniqueItems: true,
      items: T.Bool,
      minItems: 6,
    });
  });
});

describe(T.tuple.name, () => {
  it('should create empty tuple schema when called without args', () => {
    expect(T.tuple()).toEqual({
      type: 'array',
      items: [],
      additionalItems: false,
    });

    expect(T.tuple([])).toEqual({
      type: 'array',
      items: [],
      additionalItems: false,
    });
  });

  it('should accept multiple schemas', () => {
    expect(T.tuple(T.Bool)).toEqual({
      type: 'array',
      items: [T.Bool],
      additionalItems: false,
    });

    expect(T.tuple(T.Bool, T.Null)).toEqual({
      type: 'array',
      items: [T.Bool, T.Null],
      additionalItems: false,
    });

    expect(T.tuple([], T.Bool, [T.int(), T.float()], T.Null)).toEqual({
      type: 'array',
      items: [T.Bool, T.int(), T.float(), T.Null],
      additionalItems: false,
    });
  });
});