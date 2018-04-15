import * as T from './schema-types';
import * as G from './generate';
import { wrapFactory, regAsSchema } from './register';

export { validatorFor } from './validate';

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

export const Bool = regAsSchema(T.Bool);
export const Null = regAsSchema(T.Null);
