export const isOptsStr = x => typeof x === 'string';

function tryParseUniq(str) {
  if (str === 'uniq' || str === 'unique') {
    return { type: 'uniq' };
  }
}

export const uniq = () => opt => opt.type === 'uniq';

const getLeftBoundary = ([op, incl], val) => {
  const ret = op === '<' ? { min: val } : { max: val };
  if (!incl) ret[op === '<' ? 'exclusiveMin' : 'exclusiveMax'] = true;
  return ret;
};

const getRightBoundary = ([op, incl], val) => {
  const ret = op === '>' ? { min: val } : { max: val };
  if (!incl) ret[op === '>' ? 'exclusiveMin' : 'exclusiveMax'] = true;
  return ret;
};

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

//                      | lhs   |          | bind |           | rhs   |
const MULT_REGEX = /^(?:([\d\.]+)\s*\*\s*)?([a-z]+)(?:\s*\*\s*([\d\.]+))?$/i;

function tryParseMult(str) {
  const match = str.trim().match(MULT_REGEX);

  if (!match) return;
  const [, lhs, binding, rhs] = match;
  if (lhs && rhs) return;
  if (!lhs && !rhs) return;

  return { type: 'mult', binding, multiplier: parseFloat(lhs || rhs) };
}

export const mult = binding => opt =>
  opt.type === 'mult' && opt.binding === binding;

export function minIntFromExclusiveFloat(exclusiveMin) {
  if (Number.isInteger(exclusiveMin)) {
    return exclusiveMin + 1;
  }
  return Math.ceil(exclusiveMin);
}

export function maxIntFromExclusiveFloat(exclusiveMax) {
  if (Number.isInteger(exclusiveMax)) {
    return exclusiveMax - 1;
  }
  return Math.floor(exclusiveMax);
}

export function minIntFromInclusiveFloat(inclusiveMin) {
  return Math.ceil(inclusiveMin);
}

export function maxIntFromInclusiveFloat(inclusiveMax) {
  return Math.floor(inclusiveMax);
}

export function parse(spec) {
  if (!spec) return [];
  return spec.split(/\s*,\s*/).reduce((acc, part) => {
    const parsed =
      tryParseUniq(part) || tryParseRangeOpt(part) || tryParseMult(part);
    return parsed ? [...acc, parsed] : acc;
  }, []);
}
