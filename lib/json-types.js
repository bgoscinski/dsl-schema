"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { toString } = Object.prototype;
function isNullLike(x) {
    return x == null;
}
exports.isNullLike = isNullLike;
function isBooleanLike(x) {
    return x === true || x === false || toString.call(x) === '[object Boolean]';
}
exports.isBooleanLike = isBooleanLike;
function isNumberLike(x) {
    return typeof x === 'number' || toString.call(x) === '[object Number]';
}
exports.isNumberLike = isNumberLike;
function isStringLike(x) {
    return typeof x === 'string' || toString.call(x) === '[object String]';
}
exports.isStringLike = isStringLike;
function isArrayLike(x) {
    return (x != null &&
        (Array.isArray(x) ||
            (typeof x === 'object' && isNumberLike(x.length) && !isStringLike(x))));
}
exports.isArrayLike = isArrayLike;
function isObjectLike(x) {
    return x != null && toString.call(x) === '[object Object]';
}
exports.isObjectLike = isObjectLike;
