import { CompilerBase, match, MATCH_OR_SYMBOL, matchResult } from './matcher'
import assert from 'assert'

describe('Matching test.', () => {
  it('Match function.', () => {
    assert.ok(match(
      [s => s === 'first', s => s === 'second'],
      ['first', 'second']
    ))
  })
  it('Not match failing function', () => {
    assert.ok(!match(
      [s => s === 'first', () => false],
      ['first', 'second']
    ))
  })
  it('Not match too many matching function.', () => {
    assert.ok(!match(
      [s => s === 'first', s => s === 'second', s => s === 'second'],
      ['first', 'second']
    ))
  })
  it('Not match too many target string.', () => {
    assert.ok(!match(
      [s => s === 'first', s => s === 'second'],
      ['first', 'second', 'third']
    ))
  })
  it('Match with matchResult.NO_CONSUME .', () => {
    assert.ok(match(
      [s => s === 'first', () => matchResult.NO_CONSUME, s => s === 'second'],
      ['first', 'second']
    ))
  })
  it('Match with matchResult.NO_CONSUME for empty .', () => {
    assert.ok(match(
      [() => matchResult.NO_CONSUME],
      []
    ))
  })
  it('Match for matchResult.NO_CONSUME at the end.', () => {
    assert.ok(match(
      [s => s === 'first', s => s === 'second', () => matchResult.NO_CONSUME],
      ['first', 'second']
    ))
  })
  it('Match for matchResult.NO_CONSUME for empty.', () => {
    assert.ok(match(
      [() => matchResult.NO_CONSUME],
      []
    ))
  })
  it('Match with matchResult.NO_OR_ONE_CONSUME (no consume) .', () => {
    assert.ok(match(
      [s => s === 'first', () => matchResult.NO_OR_ONE_CONSUME, s => s === 'second'],
      ['first', 'second']
    ))
  })
  it('Match with matchResult.NO_OR_ONE_CONSUME (one consume) .', () => {
    assert.ok(match(
      [s => s === 'first', () => matchResult.NO_OR_ONE_CONSUME, s => s === 'third'],
      ['first', 'second', 'third']
    ))
  })
  it('Not match with matchResult.NO_OR_ONE_CONSUME (two consume) .', () => {
    assert.ok(!match(
      [s => s === 'first', () => matchResult.NO_OR_ONE_CONSUME, s => s === 'fourth'],
      ['first', 'second', 'third', 'fourth']
    ))
  })
  it('Match for matchResult.NO_OR_ONE_CONSUME at the end.', () => {
    assert.ok(match(
      [s => s === 'first', s => s === 'second', () => matchResult.NO_OR_ONE_CONSUME],
      ['first', 'second']
    ))
  })
  it('Match for matchResult.NO_OR_ONE_CONSUME only.', () => {
    assert.ok(match(
      [() => matchResult.NO_OR_ONE_CONSUME],
      ['first']
    ))
  })
  it('Match for matchResult.ANY_CONSUME with no value .', () => {
    assert.ok(match(
      [s => s === 'first', () => matchResult.ANY_CONSUME, s => s === 'second'],
      ['first', 'second']
    ))
  })
  it('Match for matchResult.ANY_CONSUME for empty .', () => {
    assert.ok(match(
      [() => matchResult.ANY_CONSUME],
      []
    ))
  })
  it('Match for matchResult.ANY_CONSUME only .', () => {
    assert.ok(match(
      [() => matchResult.ANY_CONSUME],
      ['first', 'second']
    ))
  })
  it('Match one obj for matchResult.ANY_CONSUME .', () => {
    assert.ok(match(
      [s => s === 'first', () => matchResult.ANY_CONSUME, s => s === 'second'],
      ['first', 'NO_USE', 'second']
    ))
  })
  it('Match two obj for matchResult.ANY_CONSUME .', () => {
    assert.ok(match(
      [s => s === 'first', () => matchResult.ANY_CONSUME, s => s === 'second'],
      ['first', 'NO_USE', 'NO_USE2', 'second']
    ))
  })
  it('Match for matchResult.ANY_CONSUME at the end.', () => {
    assert.ok(match(
      [s => s === 'first', s => s === 'second', () => matchResult.ANY_CONSUME],
      ['first', 'second']
    ))
  })
  it('Match for first pattern of MATCH_OR_SYMBOL', () => {
    assert.ok(match(
      [s => s === 'first', s => s === 'second', MATCH_OR_SYMBOL, s => s === 'third'],
      ['first', 'second']
    ))
  })
  it('Match for after pattern of MATCH_OR_SYMBOL', () => {
    assert.ok(match(
      [s => s === 'illegal', MATCH_OR_SYMBOL, s => s === 'first', s => s === 'second'],
      ['first', 'second']
    ))
  })
})

describe('CompilerBase test.', () => {
  it('Compile single string.', () => {
    const matcher = new CompilerBase().compile(['first'])
    assert.ok(matcher(['first']))
    assert.ok(!matcher(['second']))
  })
  it('Compile multi string.', () => {
    const matcher = new CompilerBase().compile(['first', 'second'])
    assert.ok(matcher(['first', 'second']))
    assert.ok(!matcher(['first', 'third']))
  })
  it('Compile function.', () => {
    const matcher = new CompilerBase().compile(
      ['first', input => input === 'second' ? matchResult.OK : matchResult.FAIL]
    )
    assert.ok(matcher(['first', 'second']))
    assert.ok(!matcher(['first', 'third']))
  })
  it('Compile regular expression.', () => {
    const matcher = new CompilerBase().compile(
      ['first', /sec.nd/g]
    )
    assert.ok(matcher(['first', 'second']))
    assert.ok(!matcher(['first', 'third']))
  })
  it('Compile array.', () => {
    const matcher = new CompilerBase().compile(
      ['first', ['second', 'two']]
    )
    assert.ok(matcher(['first', 'second']))
    assert.ok(matcher(['first', 'two']))
    assert.ok(!matcher(['first', 'third']))
  })
  it('Compile boolean.', () => {
    const matcher = new CompilerBase().compile(
      ['first', true]
    )
    assert.ok(matcher(['first', 'second']))
    assert.ok(!matcher(['first', 'second', 'third']))
  })
})
