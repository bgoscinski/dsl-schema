import * as Pred from './json-types';
import * as T from './schema-types';
import { isRegistered } from './register';

export function sthLike(example) {
  if (isRegistered(example)) return example;

  if (Pred.isNullLike(example)) return T.NULL;
  if (Pred.isBooleanLike(example)) return T.BOOL;
  if (Pred.isNumberLike(example)) {
    if (Number.isInteger(example)) {
      return T.int();
    } else {
      return T.float();
    }
  }
  if (Pred.isStringLike(example)) return T.str();
  if (Pred.isArrayLike(example))
    return T.tuple(Array.from(example).map(sthLike));
  if (Pred.isObjectLike(example)) {
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
