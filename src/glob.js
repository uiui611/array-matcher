/**
 * This file contains a compiler for matcher list compiles as glob syntax.
 * @file
 * @author mizu-mizu
 */
import { ANY_CONSUME_MATCHER, CompilerBase, matchResult, match } from './matcher'

/**
 * Tokenize the single glob.
 * @param {string} glob The glob string (not contains '/').
 * @return {string[]} The tokens.
 * @private
 * @example
 * tokenize('ab[c-e]f'); // => ['a', 'b', '[c-e]', 'f']
 */
function tokenize (glob) {
  const res = []
  let index = 0
  function bracket () {
    const from = index
    while (glob[++index] !== ']') {
      if (index >= glob.length) throw new Error('The right bracket "]" is not found. > ' + glob)
    }
    res.push(glob.substring(from, ++index))
  }
  while (index < glob.length) {
    if (glob[index] === '[') bracket()
    else res.push(glob[index++])
  }
  return res
}

/**
 * Resolve the character matcher pattern represented by '[...]'.
 * @param {string} pattern The pattern (not contains the brackets). e.g 'a-z'
 * @return {function} The character matcher.
 *   Accept string (whose length is equals to 1), then returns true (if it matches) or false.
 * @private
 * @example
 * const selector = charSelector('a-z');
 * selector('a'); // => true
 * selector('A'); // => false
 * const selector2 = charSelector('abc');
 * selector2('a'); // => true
 * selector2('d'); // => false
 */
function charSelector (pattern) {
  const allowed = []
  let index = 0
  function range () {
    const from = pattern.charCodeAt(index)
    const to = pattern.charCodeAt(index += 2)
    allowed.push(ch => from <= ch.charCodeAt(0) && ch.charCodeAt(0) <= to)
    index++
  }
  while (index < pattern.length) {
    if (pattern.length > index + 2 && pattern[index + 1] === '-') range()
    else {
      const p = pattern[index++]
      allowed.push(ch => ch === p)
    }
  }
  return ch => allowed.some(fnc => fnc(ch)) ? matchResult.OK : matchResult.FAIL
}

class GlobCompiler extends CompilerBase {
  acceptString (str) {
    if (str === '**') return ANY_CONSUME_MATCHER
    const patterns = tokenize(str)
      .map(p => {
        if (p === '*') return ANY_CONSUME_MATCHER
        if (p === '?') return ch => ch ? matchResult.OK : matchResult.FAIL
        if (p[0] === '[') return charSelector(p.slice(1, -1))
        return ch => p === ch ? matchResult.OK : matchResult.FAIL
      })
    return target => match(patterns, target.split('')) ? matchResult.OK : matchResult.FAIL
  }
}

/**
 * Compile the pattern as a glob syntax.
 * @param globs The glob syntax.
 * @return {function} The matching function accepts the string array and returns if the array matches to the glob.
 * @example
 * const matcher = glob('first/*.txt');
 * matcher(['first', 'hoge.txt']); // => true
 * matcher(['first', 'hoge.bin']); // => false
 * matcher('first/second.txt'.split('/')); // => true
 */
export function glob (globs) {
  if (typeof globs === 'string') globs = globs.split('/')
  return new GlobCompiler().compile(globs)
}
