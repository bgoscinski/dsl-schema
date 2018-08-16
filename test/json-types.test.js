const J = require('../dist/json-types');

const vals = {
  pojo: ['pojo', {}],
  array: ['array', []],
  number: ['number', 0],
  string: ['string', ''],
  NaN: ['NaN', NaN],
  true: ['true', true],
  false: ['false', false],
  null: ['null', null],
  undefined: ['undefined', undefined],
  // prettier-ignore
  arguments: ['arguments', (function() { return arguments; })()],
  classInstance: ['class instance', new class {}()],
  arrayInstance: ['array instance', new Array(0)],
  function: ['function', function() {}],
  arrowFunction: ['arrow function', () => {}],
  class: ['class', class {}],
  functionInstance: ['Function instance', new Function('')],
  booleanInstance: ['Boolean instance', new Boolean(false)],
  numberInstance: ['Number instance', new Number(0)],
  stringInstance: ['String instance', new String('')],
};

const diff = (all, toRemove) =>
  Array.from(Object.values(all)).filter(v => !toRemove.includes(v));

describe.each`
  predicate               | okVals
  ${J.isArrayLike.name}   | ${[vals.array, vals.arrayInstance, vals.arguments]}
  ${J.isBooleanLike.name} | ${[vals.booleanInstance, vals.true, vals.false]}
  ${J.isNullLike.name}    | ${[vals.null, vals.undefined]}
  ${J.isNumberLike.name}  | ${[vals.number, vals.NaN, vals.numberInstance]}
  ${J.isObjectLike.name}  | ${[vals.pojo, vals.classInstance]}
  ${J.isStringLike.name}  | ${[vals.stringInstance, vals.string]}
`('json type predicate $predicate', ({ predicate, okVals }) => {
  const pred = J[predicate];
  const notOkVals = diff(vals, okVals);

  okVals.forEach(([name, val]) => {
    it('should return `true` for ' + name, () => {
      expect(pred(val)).toBe(true);
    });
  });

  notOkVals.forEach(([name, val]) => {
    it('should return `false` for ' + name, () => {
      expect(pred(val)).toBe(false);
    });
  });
});
