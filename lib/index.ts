import * as Public from './public-api'
import { sthLike } from './generate'
import { wrapFactory } from './register'

export * from './public-api'
export default Object.assign(wrapFactory(sthLike), Public)
