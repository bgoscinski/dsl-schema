const schemaSet = new WeakSet();

export function isRegistered(x) {
  return schemaSet.has(x);
}

export function regAsSchema(x) {
  schemaSet.add(x);
  return x;
}

export function wrapFactory(factory) {
  for (const prop of ['name', 'length', 'displayName']) {
    const desc = Object.getOwnPropertyDescriptor(factory, prop);
    if (desc) {
      Object.defineProperty(wrapper, prop, desc);
    }
  }

  return wrapper;

  function wrapper(...args) {
    return regAsSchema(factory.apply(this, args));
  }
}

const taggerSet = new WeakSet();

export function isTagged(x) {
  return taggerSet.has(x);
}

export function regAsTagged(x) {
  taggerSet.add(x);
  return x;
}

export function wrapTagger(tagger) {
  for (const prop of ['name', 'length', 'displayName']) {
    const desc = Object.getOwnPropertyDescriptor(tagger, prop);
    if (desc) {
      Object.defineProperty(wrapper, prop, desc);
    }
  }

  return wrapper;

  function wrapper(...args) {
    return regAsTagged(tagger.apply(this, args));
  }
}
