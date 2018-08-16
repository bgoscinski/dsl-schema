import * as Opts from './opts';
import * as J from './json-types';

const minIntFromFloat = (min, excl) =>
  excl && Number.isInteger(min) ? min + 1 : Math.ceil(min);

const maxIntFromFloat = (max, excl) =>
  excl && Number.isInteger(max) ? max - 1 : Math.floor(max);

const isPrimitiveLike = x =>
  J.isNullLike(x) ||
  J.isBooleanLike(x) ||
  J.isNumberLike(x) ||
  J.isStringLike(x);

function isMemberTag(x) {
  return x && x.tag === 'member' && isSchema(x.schema);
}

export function isSchema(x) {
  if (!x) return false;
  if (typeof x !== 'object' || Array.isArray(x)) return false;
  if (typeof x.type === 'string') return true;
  const keys = Object.keys(x);

  if (keys.length === 1) {
    return (
      isSchema(x.not) ||
      isSchemaList(x.allOf || x.anyOf || x.oneOf) ||
      (Array.isArray(x.enum) && x.enum.every(isPrimitiveLike))
    );
  }

  return false;
}

function isSchemaList(x) {
  return Array.isArray(x) && x.every(isSchema);
}

export function Str(optsStr?: string) {
  const schema: any = { type: 'string' };
  const opts = Opts.parse(optsStr);
  const len = opts.find(Opts.range('len')) || opts.find(Opts.range('length'));

  if (len && len.min !== undefined)
    schema.minLength = minIntFromFloat(len.min, len.exclusiveMin);

  if (len && len.max !== undefined)
    schema.maxLength = maxIntFromFloat(len.max, len.exclusiveMax);

  return schema;
}

function num(optsStr?: string) {
  const schema: any = {};
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

export function Int(optsStr?: string) {
  const schema = num(optsStr);
  schema.type = 'integer';
  return schema;
}

export function Float(optsStr?: string) {
  const schema = num(optsStr);
  schema.type = 'number';
  return schema;
}

const reqCall = `${req.name}(schema)`;
export function req(schema) {
  if (isSchema(schema)) {
    return { tag: 'member', required: true, schema };
  }
  throw Error(reqCall + ': schema should be a schema');
}

const optCall = `${opt.name}(schema)`;
export function opt(schema) {
  if (isSchema(schema)) {
    return { tag: 'member', schema };
  }
  throw Error(optCall + ': schema should be a schema');
}

const RecordCall = `${Record.name}(members)`;
export function Record(members) {
  if (!members || typeof members !== 'object' || Array.isArray(members)) {
    throw Error(RecordCall + ': `members` should be an object');
  }

  const keys = Object.keys(members);
  if (!keys.every(key => isMemberTag(members[key]))) {
    const advice = `Use \`${req.name}\` or \`${opt.name}\` helpers`;
    throw Error(RecordCall + `: Some members are not tagged. ${advice}`);
  }

  return {
    type: 'object',
    properties: keys.reduce((acc, key) => {
      acc[key] = members[key].schema;
      return acc;
    }, {}),
    required: keys.filter(key => members[key].required),
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

  const schema: any = { type: 'object', additionalProperties: itemsSchema };
  const opts = Opts.parse(optsStr);
  const size =
    opts.find(Opts.range('size')) ||
    opts.find(Opts.range('len')) ||
    opts.find(Opts.range('length'));

  if (size && size.min !== undefined)
    schema.minItems = minIntFromFloat(size.min, size.exclusiveMin);

  if (size && size.max !== undefined)
    schema.maxItems = maxIntFromFloat(size.max, size.exclusiveMax);

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

  const schema: any = { type: 'array' };
  const opts = Opts.parse(optsStr);
  const len =
    opts.find(Opts.range('size')) ||
    opts.find(Opts.range('len')) ||
    opts.find(Opts.range('length'));
  const uniq = opts.find(Opts.uniq());

  if (itemsSchema) schema.items = itemsSchema;

  if (len && len.min !== undefined)
    schema.minItems = minIntFromFloat(len.min, len.exclusiveMin);

  if (len && len.max !== undefined)
    schema.maxItems = maxIntFromFloat(len.max, len.exclusiveMax);

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

const TupleCall = `${Tuple.name}(member0, member1, ...)`;
export function Tuple(...members) {
  members = [].concat(...members);

  if (!members.every(isMemberTag)) {
    const advice = `Use \`${req.name}\` or \`${opt.name}\` helpers`;
    throw Error(
      TupleCall + `: every \`member\` should be a tagged schema. ${advice}`
    );
  }

  const required = [];
  const optional = [];

  for (let i = members.length - 1; i >= 0; i--) {
    const mem = members[i];
    if (mem.required) {
      required.unshift(mem.schema);
    } else if (required.length) {
      required.unshift(OneOf(mem.schema, NULL));
    } else {
      optional.unshift(mem.schema);
    }
  }

  return {
    type: 'array',
    items: required.concat(optional),
    minItems: required.length,
    maxItems: required.length + optional.length,
    additionalItems: false,
  };
}

const EnumCall = `${Enum.name}(...opts)`;
export function Enum(...items) {
  items = [].concat(...items);
  if (!items.length) {
    throw Error(EnumCall + ': `opts` should be nonempty');
  }
  if (!items.every(isPrimitiveLike)) {
    throw Error(EnumCall + ': `opts` should contain only primitives');
  }
  if (new Set(items).size !== items.length)
    throw Error(EnumCall + ': `opts` should be unique');
  return { enum: items };
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
