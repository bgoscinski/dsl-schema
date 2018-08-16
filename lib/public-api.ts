import * as T from './schema-types';
import * as R from './register';

export const req = R.wrapTagger(T.req);
export const opt = R.wrapTagger(T.opt);

export const Str = R.wrapFactory(T.Str);
export const Int = R.wrapFactory(T.Int);
export const Float = R.wrapFactory(T.Float);
export const Record = R.wrapFactory(T.Record);
export const Dict = R.wrapFactory(T.Dict);
export const List = R.wrapFactory(T.List);
export const Tuple = R.wrapFactory(T.Tuple);
export const Enum = R.wrapFactory(T.Enum);
export const AllOf = R.wrapFactory(T.AllOf);
export const AnyOf = R.wrapFactory(T.AnyOf);
export const OneOf = R.wrapFactory(T.OneOf);
export const Not = R.wrapFactory(T.Not);

export const ANY = R.regAsSchema(T.ANY);
export const BOOL = R.regAsSchema(T.BOOL);
export const NULL = R.regAsSchema(T.NULL);
export const DATE = R.regAsSchema(T.DATE);
export const TIME = R.regAsSchema(T.TIME);
export const DATE_TIME = R.regAsSchema(T.DATE_TIME);
export const URI = R.regAsSchema(T.URI);
export const URI_REFERENCE = R.regAsSchema(T.URI_REFERENCE);
export const URI_TEMPLATE = R.regAsSchema(T.URI_TEMPLATE);
export const URL = R.regAsSchema(T.URL);
export const EMAIL = R.regAsSchema(T.EMAIL);
export const HOSTNAME = R.regAsSchema(T.HOSTNAME);
export const IPV4 = R.regAsSchema(T.IPV4);
export const IPV6 = R.regAsSchema(T.IPV6);
export const REGEX = R.regAsSchema(T.REGEX);
export const UUID = R.regAsSchema(T.UUID);
