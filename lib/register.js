"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemaSet = new WeakSet();
function isRegistered(x) {
    return schemaSet.has(x);
}
exports.isRegistered = isRegistered;
function regAsSchema(x) {
    schemaSet.add(x);
    return x;
}
exports.regAsSchema = regAsSchema;
function wrapFactory(factory) {
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
exports.wrapFactory = wrapFactory;
