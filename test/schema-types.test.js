const T = require('../dist/schema-types');

describe(T.Str.name, () => {
  it('should just work', () => {
    expect(T.Str()).toEqual({ type: 'string' });
  });

  it('should allow to specify minLength and maxLength', () => {
    expect(T.Str('1 < len <= 2')).toEqual({
      type: 'string',
      minLength: 2,
      maxLength: 2,
    });

    expect(T.Str('1 <= len < 2')).toEqual({
      type: 'string',
      minLength: 1,
      maxLength: 1,
    });

    expect(T.Str('1 <= len')).toEqual({
      type: 'string',
      minLength: 1,
    });

    expect(T.Str('2 > len')).toEqual({
      type: 'string',
      maxLength: 1,
    });
  });

  it('should coerce non-integer lengths to ints', () => {
    expect(T.Str('1.2 < len < 4.3')).toEqual({
      type: 'string',
      minLength: 2,
      maxLength: 4,
    });

    expect(T.Str('1.2 <= len <= 4.3')).toEqual({
      type: 'string',
      minLength: 2,
      maxLength: 4,
    });
  });
});

describe.each`
  schemaType   | factory
  ${'integer'} | ${T.Int}
  ${'number'}  | ${T.Float}
`('$schemaType', ({ schemaType, factory }) => {
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

    expect(factory('1.3*n')).toEqual({
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
    expect(factory('12*n, x > 6')).toEqual({
      type: schemaType,
      exclusiveMinimum: 6,
      multipleOf: 12,
    });
  });
});

describe(T.Record.name, () => {
  it('should require tagged schema dict as an argument', () => {
    const invalidType = 'should be an object';
    const notTagged = 'members are not tagged';
    expect(() => T.Record()).toThrow(invalidType);
    expect(() => T.Record(1)).toThrow(invalidType);
    expect(() => T.Record([])).toThrow(invalidType);
    expect(() => T.Record({ x: 4 })).toThrow(notTagged);
    expect(() => T.Record({ x: [] })).toThrow(notTagged);
  });

  it('should work', () => {
    const schema = T.Record({
      foo: T.opt(T.Int()),
      someProp: T.req(T.BOOL),
    });

    expect(schema).toEqual({
      type: 'object',
      properties: {
        foo: T.Int(),
        someProp: T.BOOL,
      },
      required: ['someProp'],
      additionalProperties: false,
    });
  });
});

describe(T.Dict.name, () => {
  it('should require item schema as an arg', () => {
    expect(() => T.Dict()).toThrow(/should be a schema/);
    expect(() => T.Dict(1)).toThrow(/should be a schema/);
  });

  it('should work', () => {
    expect(T.Dict(T.BOOL)).toEqual({
      type: 'object',
      additionalProperties: T.BOOL,
    });
  });

  it('should allow to specify minItems and maxItems', () => {
    expect(T.Dict('1 < len < 77', T.BOOL)).toEqual({
      type: 'object',
      additionalProperties: T.BOOL,
      minItems: 2,
      maxItems: 76,
    });

    expect(T.Dict('1 <= length <= 77', T.BOOL)).toEqual({
      type: 'object',
      additionalProperties: T.BOOL,
      minItems: 1,
      maxItems: 77,
    });

    expect(T.Dict('1.3 < size < 77.8', T.BOOL)).toEqual({
      type: 'object',
      additionalProperties: T.BOOL,
      minItems: 2,
      maxItems: 77,
    });

    expect(T.Dict('1.3 <= size <= 77.8', T.BOOL)).toEqual({
      type: 'object',
      additionalProperties: T.BOOL,
      minItems: 2,
      maxItems: 77,
    });
  });
});

describe(T.List.name, () => {
  it('should just work', () => {
    expect(T.List()).toEqual({
      type: 'array',
    });
  });

  it('should allow to specify items schema', () => {
    expect(T.List(T.BOOL)).toEqual({
      type: 'array',
      items: T.BOOL,
    });
  });

  it(`should suggest ${T.Tuple.name} when called with multiple schemas`, () => {
    const suggestion = `Did you mean ${T.Tuple.name}`;
    expect(() => T.List(T.BOOL, T.Int())).toThrow(suggestion);
    expect(() => T.List([T.BOOL, T.Int()])).toThrow(suggestion);
    expect(() => T.List('uniq', T.BOOL, T.Int())).toThrow(suggestion);
    expect(() => T.List('uniq', [T.BOOL, T.Int()])).toThrow(suggestion);
  });

  it('should allow to specify minItems and maxItems', () => {
    expect(T.List('3 < len < 23')).toEqual({
      type: 'array',
      minItems: 4,
      maxItems: 22,
    });

    expect(T.List('3 <= size <= 23')).toEqual({
      type: 'array',
      minItems: 3,
      maxItems: 23,
    });

    expect(T.List('3.5 < length < 23.4')).toEqual({
      type: 'array',
      minItems: 4,
      maxItems: 23,
    });

    expect(T.List('3.5 <= len <= 23.4')).toEqual({
      type: 'array',
      minItems: 4,
      maxItems: 23,
    });
  });

  it('should allow to specify uniqueness', () => {
    expect(T.List('uniq')).toEqual({
      type: 'array',
      uniqueItems: true,
    });
  });

  it('should allow to specify all the things at the same time', () => {
    expect(T.List('uniq, len > 5', T.BOOL)).toEqual({
      type: 'array',
      uniqueItems: true,
      items: T.BOOL,
      minItems: 6,
    });
  });
});

describe(T.Tuple.name, () => {
  it('should create empty tuple schema when called without args', () => {
    expect(T.Tuple()).toEqual({
      type: 'array',
      items: [],
      minItems: 0,
      maxItems: 0,
      additionalItems: false,
    });

    expect(T.Tuple([])).toEqual({
      type: 'array',
      items: [],
      minItems: 0,
      maxItems: 0,
      additionalItems: false,
    });
  });

  it('should accept multiple tagged schemas', () => {
    expect(T.Tuple(T.req(T.BOOL))).toEqual({
      type: 'array',
      items: [T.BOOL],
      minItems: 1,
      maxItems: 1,
      additionalItems: false,
    });

    expect(T.Tuple(T.req(T.BOOL), T.req(T.NULL))).toEqual({
      type: 'array',
      items: [T.BOOL, T.NULL],
      minItems: 2,
      maxItems: 2,
      additionalItems: false,
    });

    expect(
      T.Tuple(
        [],
        T.req(T.BOOL),
        [],
        [T.req(T.Int()), T.req(T.Float())],
        T.req(T.NULL),
        []
      )
    ).toEqual({
      type: 'array',
      items: [T.BOOL, T.Int(), T.Float(), T.NULL],
      minItems: 4,
      maxItems: 4,
      additionalItems: false,
    });
  });

  it('should allow optional elements at the end of tuple', () => {
    expect(T.Tuple(T.req(T.Int()), T.opt(T.Float()), T.opt(T.NULL))).toEqual({
      type: 'array',
      items: [T.Int(), T.Float(), T.NULL],
      minItems: 1,
      maxItems: 3,
      additionalItems: false,
    });
  });

  it('should handle optional elements between required ones (should be OneOf [x, NULL])', () => {
    expect(T.Tuple(T.req(T.Int()), T.opt(T.Int()), T.req(T.Float()))).toEqual({
      type: 'array',
      items: [T.Int(), T.OneOf(T.Int(), T.NULL), T.Float()],
      minItems: 3,
      maxItems: 3,
      additionalItems: false,
    });
  });
});

describe(T.Enum.name, () => {
  it('should take primitives or arrays of primitives', () => {
    expect(T.Enum(1, [2])).toEqual({
      enum: [1, 2],
    });

    expect(() => T.Enum([[3]])).toThrow('should contain only primitives');
  });

  it('should throw when empty', () => {
    expect(() => T.Enum()).toThrow('should be nonempty');
    expect(() => T.Enum([])).toThrow('should be nonempty');
  });

  it('should throw on duplicated options', () => {
    expect(() => T.Enum(1, [1])).toThrow('should be unique');
    expect(() => T.Enum([1], [1])).toThrow('should be unique');
    expect(() => T.Enum(1, [], 1)).toThrow('should be unique');
  });
});

describe.each`
  factoryName     | propName   | error
  ${T.AllOf.name} | ${'allOf'} | ${'should be a schema or array of schemas'}
  ${T.AnyOf.name} | ${'anyOf'} | ${'should be a schema or array of schemas'}
  ${T.OneOf.name} | ${'oneOf'} | ${'should be a schema or array of schemas'}
  ${T.Not.name}   | ${'not'}   | ${'should be a schema'}
`('$factoryName factory', ({ factoryName, propName, error }) => {
  const factory = T[factoryName];

  it('should produce schema', () => {
    expect(factory(T.BOOL)[propName]).toBeTruthy();
  });

  it('should throw when passed non schema args', () => {
    expect(() => factory(3)).toThrow(error);
  });
});

describe(T.isSchema.name, () => {
  it('should just work', () => {
    expect(T.isSchema()).toBe(false);
    expect(T.isSchema(42)).toBe(false);
    expect(T.isSchema({})).toBe(false);
    expect(T.isSchema([])).toBe(false);

    expect(T.isSchema(T.Str())).toBe(true);
    expect(T.isSchema(T.Int())).toBe(true);
    expect(T.isSchema(T.Float())).toBe(true);
    expect(T.isSchema(T.Record({}))).toBe(true);
    expect(T.isSchema(T.Dict(T.Int()))).toBe(true);
    expect(T.isSchema(T.List())).toBe(true);
    expect(T.isSchema(T.Tuple())).toBe(true);
    expect(T.isSchema(T.Enum(3))).toBe(true);

    expect(T.isSchema(T.AllOf())).toBe(true);
    expect(T.isSchema(T.AllOf(T.Int(), T.Float()))).toBe(true);
    expect(T.isSchema(T.AnyOf())).toBe(true);
    expect(T.isSchema(T.AnyOf(T.Int(), T.Float()))).toBe(true);
    expect(T.isSchema(T.OneOf(T.Int(), T.Float()))).toBe(true);
    expect(T.isSchema(T.OneOf(T.Int(), T.Float()))).toBe(true);
    expect(T.isSchema(T.Not(T.Int()))).toBe(true);
  });
});
