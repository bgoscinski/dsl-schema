export const isOptsStr = x => typeof x === 'string';

function tryParseUniq(str) {
  if (str === 'uniq' || str === 'unique') {
    return { type: 'uniq' };
  }
}

export const uniq = () => opt => opt.type === 'uniq';

const getLeftBoundary = ([op, incl], val) =>
  op === '<'
    ? { min: val, exclusiveMin: !incl }
    : { max: val, exclusiveMax: !incl };

const getRightBoundary = ([op, incl], val) =>
  op === '>'
    ? { min: val, exclusiveMin: !incl }
    : { max: val, exclusiveMax: !incl };

//                       | lhs   |   | lop  |     | bind |      | rop  |   | rhs   |
const RANGE_REGEX = /^(?:([\d\.]+)\s*([<>]=?)\s*)?([a-z]+)(?:\s*([<>]=?)\s*([\d\.]+))?$/i;

function tryParseRangeOpt(str) {
  const match = str.trim().match(RANGE_REGEX);

  if (!match) return;
  const [, lhs, lop, binding, rop, rhs] = match;
  if (!lop && !rop) return;
  if (lop && rop && lop.charAt(0) !== rop.charAt(0)) return;

  return {
    type: 'range',
    binding,
    ...(lop && getLeftBoundary(lop, parseFloat(lhs))),
    ...(rop && getRightBoundary(rop, parseFloat(rhs))),
  };
}

export const range = binding => opt =>
  opt.type === 'range' && opt.binding === binding;

//                      | lhs   |               | bind |           | rhs   |
const MULT_REGEX = /^(?:([\d\.]+)(?:\s*\*\s*)?)?([a-z]+)(?:\s*\*\s*([\d\.]+))?$/i;

function tryParseMult(str) {
  const match = str.trim().match(MULT_REGEX);

  if (!match) return;
  const [, lhs, binding, rhs] = match;
  if (lhs && rhs) return;

  return { type: 'mult', binding, multiplier: parseFloat(lhs || rhs) };
}

export const mult = binding => opt =>
  opt.type === 'mult' && opt.binding === binding;

export function toInclusiveMinInt(exclusiveMin) {
  if (exclusiveMin % 1 === 0) {
    return exclusiveMin + 1;
  }
  return Math.ceil(exclusiveMin);
}

export function toInclusiveMaxInt(exclusiveMin) {
  if (exclusiveMin % 1 === 0) {
    return exclusiveMin - 1;
  }
  return Math.floor(exclusiveMin);
}

export function parse(spec) {
  if (!spec) return [];
  return spec.split(/,\s*/).reduce((acc, part) => {
    const parsed =
      tryParseUniq(part) || tryParseRangeOpt(part) || tryParseMult(part);
    return parsed ? [...acc, parsed] : acc;
  }, []);
}
