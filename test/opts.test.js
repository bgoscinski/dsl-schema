const { parse } = require('../dist/opts')

describe('Opts.parse', () => {
  it('should parse range opts', () => {
    expect(parse('1 < var < 2')[0]).toEqual({
      type: 'range',
      binding: 'var',
      min: 1,
      max: 2,
      exclusiveMin: true,
      exclusiveMax: true,
    })

    expect(parse('1 <= foo <= 2')[0]).toEqual({
      type: 'range',
      binding: 'foo',
      min: 1,
      max: 2,
    })
  })

  it('should parse range without one of bounds', () => {
    expect(parse('1.12 < var')[0]).toEqual({
      type: 'range',
      binding: 'var',
      min: 1.12,
      exclusiveMin: true,
    })

    expect(parse('1 <= var')[0]).toEqual({
      type: 'range',
      binding: 'var',
      min: 1,
    })

    expect(parse('1000000000 > var')[0]).toEqual({
      type: 'range',
      binding: 'var',
      max: 1000000000,
      exclusiveMax: true,
    })

    expect(parse('1 >= var')[0]).toEqual({
      type: 'range',
      binding: 'var',
      max: 1,
    })
  })

  it('should parse multipliers', () => {
    expect(parse('n*3')[0]).toEqual({
      type: 'mult',
      binding: 'n',
      multiplier: 3,
    })

    expect(parse('3.3 * n')[0]).toEqual({
      type: 'mult',
      binding: 'n',
      multiplier: 3.3,
    })
  })

  it('should parse uniq', () => {
    expect(parse('unique')[0]).toEqual({
      type: 'uniq',
    })

    expect(parse('uniq')[0]).toEqual({
      type: 'uniq',
    })
  })

  it('should handle multiple opts', () => {
    expect(parse('3 <= x, uniq, y >= 4')).toEqual([
      { type: 'range', binding: 'x', min: 3 },
      { type: 'uniq' },
      { type: 'range', binding: 'y', min: 4 },
    ])
  })

  it('should filter out unrecognized opts', () => {
    expect(parse(',2 < x >= 3, foo, 7*7,1*c*3, , 3n,')).toEqual([])
  })
})
