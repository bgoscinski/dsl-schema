import * as Opts from './opts';

function isSchema(x) {
  if (!x) return false;
  if (typeof x !== 'object' || Array.isArray(x)) return false;
  if (typeof x.type === 'string') return true;
  const keys = Object.keys(x);

  if (keys.length === 1) {
    return (
      isSchema(x.not) || isSchemaList(x.allOf || x.anyOf || x.oneOf || x.not)
    );
  }

  return false;
}

function isSchemaList(x) {
  return Array.isArray(x) && x.every(isSchema);
}

function isSchemaDict(x) {
  if (!x || typeof x !== 'object' || Array.isArray(x)) {
    return false;
  }
  return Object.keys(x).every(key => isSchema(x[key]));
}

export function str(optsStr) {
  const schema = { type: 'string' };
  const opts = Opts.parse(optsStr);
  const len = opts.find(Opts.range('len')) || opts.find(Opts.range('length'));

  if (len && len.min !== undefined)
    schema.minLength = len.exclusiveMin
      ? Opts.toInclusiveMinInt(len.min)
      : len.min;

  if (len && len.max !== undefined)
    schema.maxLength = len.exclusiveMax
      ? Opts.toInclusiveMaxInt(len.max)
      : len.max;

  return schema;
}

function num(optsStr) {
  const schema = {};
  const opts = Opts.parse(optsStr);
  const range = opts.find(Opts.range('x'));
  const mult = opts.find(Opts.mult('n'));

  if (range && range.min !== undefined)
    schema[range.exclusiveMin ? 'exclusiveMinimum' : 'minimum'] = range.min;

  if (range && range.max !== undefined)
    schema[range.exclusiveMax ? 'exclusiveMaximum' : 'maximum'] = range.max;

  if (mult) schema.multipleOf = mult.multiplier;

  return schema;
}

export function int(optsStr) {
  const schema = num(optsStr);
  schema.type = 'integer';
  return schema;
}

export function float(optsStr) {
  const schema = num(optsStr);
  schema.type = 'number';
  return schema;
}

export function record(propertiesSchemas) {
  if (!isSchemaDict(propertiesSchemas))
    throw Error(
      `${
        record.name
      }(props): \`props\` should be an object with schemas as values`
    );

  return {
    type: 'object',
    properties: propertiesSchemas,
    required: Object.keys(propertiesSchemas).sort(),
    additionalProperties: false,
  };
}

export function dict(optsStr, itemsSchema) {
  if (arguments.length === 1) {
    itemsSchema = optsStr;
    optsStr = '';
  }

  if (!Opts.isOptsStr(optsStr) || !isSchema(itemsSchema))
    throw Error(`${dict.name}(opts?, schema): \`schema\` should be a schema`);

  const schema = { type: 'object', additionalProperties: itemsSchema };
  const opts = Opts.parse(optsStr);
  const len = opts.find(Opts.range('len')) || opts.find(Opts.range('length'));

  if (len && len.min !== undefined)
    schema.minItems = len.exclusiveMin
      ? Opts.toInclusiveMinInt(len.min)
      : len.min;

  if (len && len.max !== undefined)
    schema.maxItems = len.exclusiveMax
      ? Opts.toInclusiveMaxInt(len.max)
      : len.max;

  return schema;
}

export function list(optsStr, itemsSchema) {
  let argc = arguments.length;

  if (!Opts.isOptsStr(optsStr)) {
    itemsSchema = optsStr;
    optsStr = undefined;
    argc++;
  }

  if (isSchemaList(itemsSchema) || argc > 2)
    throw Error(
      `${
        list.name
      }(opts?, itemsSchema?): \`itemsSchema\` should be a schema. Did you mean ${
        tuple.name
      }(schema0, schema1, ...)?`
    );

  const schema = { type: 'array' };
  const opts = Opts.parse(optsStr);
  const len = opts.find(Opts.range('len')) || opts.find(Opts.range('length'));
  const uniq = opts.find(Opts.uniq());

  if (itemsSchema) schema.items = itemsSchema;

  if (len && len.min !== undefined)
    schema.minItems = len.exclusiveMin
      ? Opts.toInclusiveMinInt(len.min)
      : len.min;

  if (len && len.max !== undefined)
    schema.maxItems = len.exclusiveMax
      ? Opts.toInclusiveMaxInt(len.max)
      : len.max;

  if (uniq) schema.uniqueItems = true;

  return schema;
}

function toSchemaList(schemas, cellExample) {
  return schemas.reduce((acc, schema) => {
    if (isSchemaList(schema) || isSchema(schema)) {
      return acc.concat(schema);
    }
    throw Error(
      `${cellExample}: \`schemaN\` should be a schema or array of schemas`
    );
  }, []);
}

export function tuple(...schemas) {
  return {
    type: 'array',
    items: toSchemaList(schemas, `${tuple.name}(schema0, schema1, ...)`),
    additionalItems: false,
  };
}

export function allOf(...schemas) {
  return {
    allOf: toSchemaList(schemas, `${allOf.name}(schema0, schema1, ...)`),
  };
}

export function anyOf(...schemas) {
  return {
    anyOf: toSchemaList(schemas, `${anyOf.name}(schema0, schema1, ...)`),
  };
}

export function oneOf(...schemas) {
  return {
    oneOf: toSchemaList(schemas, `${oneOf.name}(schema0, schema1, ...)`),
  };
}

export function not(schema) {
  if (!isSchema(schema))
    throw Error(`${not.name}(schema): \`schema\` should be a schema`);

  return { not: schema };
}

export const Null = { type: 'null' };

export const Bool = { type: 'boolean' };
