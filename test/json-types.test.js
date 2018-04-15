import * as P from '../lib/json-types';
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
  functionInstance: ['Function instance', new Function('')],
  booleanInstance: ['Boolean instance', new Boolean(false)],
  numberInstance: ['Number instance', new Number(0)],
  stringInstance: ['String instance', new String('')],
};

const diff = (all, toRemove) =>
  Array.from(Object.values(all)).filter(v => !toRemove.includes(v));

const fixtures = [
  {
    pred: P.isArrayLike,
    okVals: [vals.array, vals.arrayInstance, vals.arguments],
  },
  {
    pred: P.isBooleanLike,
    okVals: [vals.booleanInstance, vals.true, vals.false],
  },
  {
    pred: P.isNullLike,
    okVals: [vals.null, vals.undefined],
  },
  {
    pred: P.isNumberLike,
    okVals: [vals.number, vals.NaN, vals.numberInstance],
  },
  {
    pred: P.isObjectLike,
    okVals: [vals.pojo, vals.classInstance],
  },
  {
    pred: P.isStringLike,
    okVals: [vals.stringInstance, vals.string],
  },
];

fdescribe('json type predicates', () => {
  fixtures.forEach(({ pred, okVals }) => {
    const notOkVals = diff(vals, okVals);

    describe(pred.name, () => {
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
  });
});
