import * as Opts from './opts';

export function isSchema(x) {
  if (!x) return false;
  if (typeof x !== 'object' || Array.isArray(x)) return false;
  if (typeof x.type === 'string') return true;
  const keys = Object.keys(x);

  if (keys.length === 1) {
    return isSchema(x.not) || isSchemaList(x.allOf || x.anyOf || x.oneOf);
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

export function Str(optsStr) {
  const schema = { type: 'string' };
  const opts = Opts.parse(optsStr);
  const len = opts.find(Opts.range('len')) || opts.find(Opts.range('length'));

  if (len && len.min !== undefined)
    schema.minLength = len.exclusiveMin
      ? Opts.minIntFromExclusiveFloat(len.min)
      : Opts.minIntFromInclusiveFloat(len.min);

  if (len && len.max !== undefined)
    schema.maxLength = len.exclusiveMax
      ? Opts.maxIntFromExclusiveFloat(len.max)
      : Opts.maxIntFromInclusiveFloat(len.max);

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

export function Int(optsStr) {
  const schema = num(optsStr);
  schema.type = 'integer';
  return schema;
}

export function Float(optsStr) {
  const schema = num(optsStr);
  schema.type = 'number';
  return schema;
}

const RecordCall = `${Record.name}(props)`;
export function Record(propertiesSchemas) {
  if (!isSchemaDict(propertiesSchemas))
    throw Error(
      RecordCall + ': `props` should be an object with schemas as values'
    );

  return {
    type: 'object',
    properties: propertiesSchemas,
    required: Object.keys(propertiesSchemas).sort(),
    additionalProperties: false,
  };
}

const DictCall = `${Dict.name}(opts?, schema)`;
export function Dict(optsStr, itemsSchema) {
  if (arguments.length === 1) {
    itemsSchema = optsStr;
    optsStr = '';
  }

  if (!Opts.isOptsStr(optsStr) || !isSchema(itemsSchema))
    throw Error(DictCall + ': `schema` should be a schema');

  const schema = { type: 'object', additionalProperties: itemsSchema };
  const opts = Opts.parse(optsStr);
  const size =
    opts.find(Opts.range('size')) ||
    opts.find(Opts.range('len')) ||
    opts.find(Opts.range('length'));

  if (size && size.min !== undefined)
    schema.minItems = size.exclusiveMin
      ? Opts.minIntFromExclusiveFloat(size.min)
      : Opts.minIntFromInclusiveFloat(size.min);

  if (size && size.max !== undefined)
    schema.maxItems = size.exclusiveMax
      ? Opts.maxIntFromExclusiveFloat(size.max)
      : Opts.maxIntFromInclusiveFloat(size.max);

  return schema;
}

const ListCall = `${List.name}(opts?, itemsSchema?)`;
export function List(optsStr, itemsSchema) {
  let argc = arguments.length;

  if (!Opts.isOptsStr(optsStr)) {
    itemsSchema = optsStr;
    optsStr = undefined;
    argc++;
  }

  if (isSchemaList(itemsSchema) || argc > 2)
    throw Error(
      ListCall +
        `: \`itemsSchema\` should be a schema. Did you mean ${TupleCall}?`
    );

  const schema = { type: 'array' };
  const opts = Opts.parse(optsStr);
  const len =
    opts.find(Opts.range('size')) ||
    opts.find(Opts.range('len')) ||
    opts.find(Opts.range('length'));
  const uniq = opts.find(Opts.uniq());

  if (itemsSchema) schema.items = itemsSchema;

  if (len && len.min !== undefined)
    schema.minItems = len.exclusiveMin
      ? Opts.minIntFromExclusiveFloat(len.min)
      : Opts.minIntFromInclusiveFloat(len.min);

  if (len && len.max !== undefined)
    schema.maxItems = len.exclusiveMax
      ? Opts.maxIntFromExclusiveFloat(len.max)
      : Opts.maxIntFromInclusiveFloat(len.max);

  if (uniq) schema.uniqueItems = true;

  return schema;
}

function toSchemaList(schemas, callExample) {
  return schemas.reduce((acc, schema) => {
    if (isSchemaList(schema) || isSchema(schema)) {
      return acc.concat(schema);
    }
    throw Error(
      `${callExample}: \`schemaN\` should be a schema or array of schemas`
    );
  }, []);
}

const TupleCall = `${Tuple.name}(schema0, schema1, ...)`;
export function Tuple(...schemas) {
  return {
    type: 'array',
    items: toSchemaList(schemas, TupleCall),
    additionalItems: false,
  };
}

const AllOfCall = `${AllOf.name}(schema0, schema1, ...)`;
export function AllOf(...schemas) {
  return {
    allOf: toSchemaList(schemas, AllOfCall),
  };
}

const AnyOfCall = `${AnyOf.name}(schema0, schema1, ...)`;
export function AnyOf(...schemas) {
  return {
    anyOf: toSchemaList(schemas, AnyOfCall),
  };
}

const OneOfCall = `${OneOf.name}(schema0, schema1, ...)`;
export function OneOf(...schemas) {
  return {
    oneOf: toSchemaList(schemas, OneOfCall),
  };
}

const NotCall = `${Not.name}(schema)`;
export function Not(schema) {
  if (isSchema(schema)) return { not: schema };
  throw Error(NotCall + '`schema` should be a schema');
}

export const NULL = { type: 'null' };
export const BOOL = { type: 'boolean' };
export const DATE = { type: 'string', format: 'date' };
export const TIME = { type: 'string', format: 'time' };
export const DATE_TIME = { type: 'string', format: 'date-time' };
export const URI = { type: 'string', format: 'uri' };
export const URI_REFERENCE = { type: 'string', format: 'uri-reference' };
export const URI_TEMPLATE = { type: 'string', format: 'uri-template' };
export const URL = { type: 'string', format: 'url' };
export const EMAIL = { type: 'string', format: 'email' };
export const HOSTNAME = { type: 'string', format: 'hostname' };
export const IPV4 = { type: 'string', format: 'ipv4' };
export const IPV6 = { type: 'string', format: 'ipv6' };
export const REGEX = { type: 'string', format: 'regex' };
export const UUID = { type: 'string', format: 'uuid' };
