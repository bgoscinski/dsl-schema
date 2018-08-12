const { toString } = Object.prototype;

export function isNullLike(x) {
  return x == null;
}

export function isBooleanLike(x) {
  return x === true || x === false || toString.call(x) === '[object Boolean]';
}

export function isNumberLike(x) {
  return typeof x === 'number' || toString.call(x) === '[object Number]';
}

export function isStringLike(x) {
  return typeof x === 'string' || toString.call(x) === '[object String]';
}

export function isArrayLike(x) {
  return (
    x != null &&
    (Array.isArray(x) ||
      (typeof x === 'object' && isNumberLike(x.length) && !isStringLike(x)))
  );
}

export function isObjectLike(x) {
  return x != null && toString.call(x) === '[object Object]';
}
