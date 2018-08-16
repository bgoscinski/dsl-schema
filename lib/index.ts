import * as Public from './public-api';
import { sthLike } from './generate';

export * from './public-api';

export default Object.assign(function like(example) {
  return sthLike(example);
}, Public);
