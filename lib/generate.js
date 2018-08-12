import * as J from './json-types';
import * as T from './schema-types';
import { predicateFor } from './validate';
import { isRegistered } from './register';

const isDateTime = predicateFor(T.DATE_TIME);
const isUrl = predicateFor(T.URL);
const isEmail = predicateFor(T.EMAIL);
const isIpv4 = predicateFor(T.IPV4);
const isIpv6 = predicateFor(T.IPV6);
const isUuid = predicateFor(T.UUID);

export function sthLike(example) {
  if (isRegistered(example)) return example;

  if (J.isNullLike(example)) return T.NULL;
  if (J.isBooleanLike(example)) return T.BOOL;
  if (J.isNumberLike(example)) {
    if (Number.isInteger(example)) {
      return T.int();
    } else {
      return T.float();
    }
  }
  if (J.isStringLike(example)) {
    if (isDateTime(example)) return T.DATE_TIME;
    if (isUrl(example)) return T.URL;
    if (isEmail(example)) return T.EMAIL;
    if (isIpv4(example)) return T.IPV4;
    if (isIpv6(example)) return T.IPV6;
    if (isUuid(example)) return T.UUID;
    return T.str();
  }
  if (J.isArrayLike(example)) return T.tuple(Array.from(example).map(sthLike));
  if (J.isObjectLike(example)) {
    const props = Object.keys(example).reduce((acc, name) => {
      acc[name] = sthLike(example[name]);
      return acc;
    }, {});

    return T.record(props);
  }

  throw TypeError(
    `${sthLike.name}(example): don't know how to create schema for ${example}`
  );
}
