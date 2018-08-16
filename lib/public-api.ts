import * as T from './schema-types';
import { wrapFactory, regAsSchema } from './register';

export { req, opt } from './schema-types';

export const Str = wrapFactory(T.Str);
export const Int = wrapFactory(T.Int);
export const Float = wrapFactory(T.Float);
export const Record = wrapFactory(T.Record);
export const Dict = wrapFactory(T.Dict);
export const List = wrapFactory(T.List);
export const Tuple = wrapFactory(T.Tuple);
export const Enum = wrapFactory(T.Enum);
export const AllOf = wrapFactory(T.AllOf);
export const AnyOf = wrapFactory(T.AnyOf);
export const OneOf = wrapFactory(T.OneOf);
export const Not = wrapFactory(T.Not);

export const ANY = regAsSchema(T.ANY);
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
