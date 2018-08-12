import * as T from './schema-types';
import * as G from './generate';
import { wrapFactory, regAsSchema } from './register';

export { validatorFor, predicateFor, assertFor } from './validate';

export const sthLike = wrapFactory(G.sthLike);

export const str = wrapFactory(T.str);
export const int = wrapFactory(T.int);
export const float = wrapFactory(T.float);
export const record = wrapFactory(T.record);
export const dict = wrapFactory(T.dict);
export const list = wrapFactory(T.list);
export const tuple = wrapFactory(T.tuple);
export const allOf = wrapFactory(T.allOf);
export const anyOf = wrapFactory(T.anyOf);
export const oneOf = wrapFactory(T.oneOf);
export const not = wrapFactory(T.not);

export const BOOL = regAsSchema(T.BOOL);
export const NULL = regAsSchema(T.NULL);
export const DATE = regAsSchema(T.DATE);
export const TIME = regAsSchema(T.TIME);
export const DATE_TIME = regAsSchema(T.DATE_TIME);
export const URI = regAsSchema(T.URI);
export const URI_REFERENCE = regAsSchema(T.URI_REFERENCE);
export const URI_TEMPLATE = regAsSchema(T.URI_TEMPLATE);
export const URL = regAsSchema(T.URL);
export const EMAIL = regAsSchema(T.EMAIL);
export const HOSTNAME = regAsSchema(T.HOSTNAME);
export const IPV4 = regAsSchema(T.IPV4);
export const IPV6 = regAsSchema(T.IPV6);
export const REGEX = regAsSchema(T.REGEX);
export const UUID = regAsSchema(T.UUID);
