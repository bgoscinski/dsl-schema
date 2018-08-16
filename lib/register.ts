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
