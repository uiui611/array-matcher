import { matchResult, match, CompilerBase } from '../dist/array-matcher'
import assert from 'assert'

describe('CREATE ORIGINAL MATCHER', () => {
  /*
     * match() accepts matching functions.
     * Each function should returns any of matchResult's property.
     * The matchresult.OK consume any number of data (the same to '**' on glob-matching).
     */
  it('Create matcher using a function array.', () => {
    /*
         * Prepare an array of matching functions.
         * This example matches all array whose first element is 'first' (not depends on it's letter case).
         */
    const matcherList = [
      str => str.toLowerCase() === 'first' ? matchResult.OK : matchResult.FAIL,
      () => matchResult.ANY_CONSUME
    ]
    const results = [
      match(matcherList, ['first', 'second']), // => true
      match(matcherList, ['FIRST', 'SECOND']), // => true
      match(matcherList, ['illegal', 'first', 'second']) // => false
    ]
    assert.deepStrictEqual(results, [true, true, false])
  })
  /*
     * You can create original matcher implementing CompilerBase.
     * The compiler base build matching function by calling #compile() method.
     * You can change it's behavior by overriding
     *   acceptString(), acceptRegexp(), acceptArray(), acceptFunction(), or acceptBoolean().
     */
  it('Create matcher using the CompilerBase class.', () => {
    /*
         * Implements the CompilerBase and override some methods.
         */
    class OriginalMatcherCompiler extends CompilerBase {
      /*
             * If you provide a string in the argument array of this#compile(), this method is called.
             * This method should return a matching function.
             */
      acceptString (str) {
        /* To support glob-like recursive match. */
        if (str === '**') return () => matchResult.ANY_CONSUME
        return target => (target && target.toLowerCase()) === str ? matchResult.OK : matchResult.FAIL
      }
    }
    const matcher = new OriginalMatcherCompiler().compile(
      ['first', '**']
    )
    const results = [
      matcher(['first', 'second']), // => true
      matcher(['FIRST', 'SECOND']), // => true
      matcher(['illegal', 'first', 'second']) // => false
    ]
    assert.deepStrictEqual(results, [true, true, false])
  })
})
