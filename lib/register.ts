import { MemberTag, Schema } from './schema-types'

const schemaSet = new WeakSet<Schema>()

export function isRegistered(x: unknown): x is Schema {
  return schemaSet.has(x as any)
}

export function regAsSchema(x: Schema): Schema {
  schemaSet.add(x)
  return x
}

export function wrapFactory<F extends (...a: any[]) => Schema>(factory: F): F {
  for (const prop of ['name', 'length', 'displayName']) {
    const desc = Object.getOwnPropertyDescriptor(factory, prop)
    if (desc) {
      Object.defineProperty(wrapper, prop, desc)
    }
  }

  return wrapper as F

  function wrapper(this: any, ...args: any[]) {
    return regAsSchema(factory.apply(this, args))
  }
}

const taggerSet = new WeakSet<MemberTag>()

export function isTagged(x: unknown): x is MemberTag {
  return taggerSet.has(x as any)
}

export function regAsTagged(x: MemberTag) {
  taggerSet.add(x)
  return x
}

export function wrapTagger<F extends (...a: any[]) => MemberTag>(tagger: F): F {
  for (const prop of ['name', 'length', 'displayName']) {
    const desc = Object.getOwnPropertyDescriptor(tagger, prop)
    if (desc) {
      Object.defineProperty(wrapper, prop, desc)
    }
  }

  return wrapper as F

  function wrapper(this: any, ...args: any[]) {
    return regAsTagged(tagger.apply(this, args))
  }
}
