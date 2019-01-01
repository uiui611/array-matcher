/**
 * This file contains the implements of the core for matching array as {@link matchToLinkedList}.
 * @file
 * @author mizu-mizu
 */
import {LinkedList} from "./util";

/**
 * The matching function for each string.
 * @callback matcher
 * @param {string|undefined} input The input source to match.
 *   The value can be `undefined` (when the stream has no entry).
 * @return {matchResult|false} The matching result.
 */

/**
 * The result for a single matching.
 * @enum matchResult
 * @readonly
 * @property OK Represents the match has succeeded,
 *   and required to consume the current target.
 * @property FAIL Represents the match has failed. This is a falsy value.
 * @property NO_CONSUME The match has succeeded and no value should be consumed.
 * @property NO_OR_ONE_CONSUME The match has succeeded and no or one value should be consumed.
 * @property ANY_CONSUME The match has succeeded and any number of value can be consumed.
 */
export const matchResult = Object.freeze({
    OK: Symbol('OK'),
    FAIL: false,
    NO_CONSUME: Symbol('NO CONSUME'),
    NO_OR_ONE_CONSUME: Symbol('NO OR ONE CONSUME'),
    ANY_CONSUME: Symbol('ANY CONSUME')
});

/**
 * A matcher that always returns the {@link matchResult.ANY_CONSUME}.
 * @type {matcher}
 */
export const ANY_CONSUME_MATCHER = () => matchResult.ANY_CONSUME;

/**
 * Test if the pattern matches the target list.
 * @param {LinkedList<function>} patternList Compiled function list.
 * @param {LinkedList<any>} targetList matching target.
 * @returns {boolean} True if and only if the pattern matches the target.
 * @example
 * import {LinkedList} from './util';
 * const patterns = [
 *   str=>str==='first' ?matchResult.OK : matchResult.FAIL,
 *   ()=> matchResult.ANY_CONSUME,
 *   str=>str==='last'?matchResult.OK : matchResult.FAIL
 * ];
 * matchToLinkedList(
 *   LinkedList.fromArray(patterns),
 *   LinkedList.fromArray(['first', 'second', 'third', 'last'])
 * ); // => true
 * matchToLinkedList(
 *   LinkedList.fromArray(patterns),
 *   LinkedList.fromArray(['first', 'second'])
 * ); // => false
 */
function matchToLinkedList(patternList, targetList){
    while(patternList.hasValue()){
        const pattern = patternList.shift();
        const res = pattern(targetList.current) || matchResult.FAIL;
        if(res===matchResult.FAIL) return false;
        else if(res===matchResult.NO_CONSUME);
        else if(res===matchResult.NO_OR_ONE_CONSUME){
            if(!targetList.hasValue() && !patternList.hasValue()) return true;
            if(matchToLinkedList(patternList.clone(),targetList.clone())) return true;
            targetList.shift();
            return matchToLinkedList(patternList.clone(), targetList);
        }
        else if(res===matchResult.ANY_CONSUME){
            if(!targetList.hasValue() && !patternList.hasValue()) return true;
            const targetClone = targetList.clone();
            while(targetClone.hasValue()){
                if(matchToLinkedList(patternList.clone(), targetClone.clone())) return true;
                targetClone.shift();
            }
            return !patternList.hasValue();
        }
        else targetList.shift();
    }
    return !targetList.hasValue();
}

/**
 * Test if the target list is match for the specified functions.
 * @param {function[]} pattern The matching function's array.
 * @param {any[]} target The matching target.
 * @returns {boolean} true if the pattern matches for the target.
 */
export function match(pattern, target){
    return matchToLinkedList(
        LinkedList.fromArray(pattern),
        LinkedList.fromArray(target)
    );
}

/**
 * The base class for compilers.
 *
 * {@link CompilerBase#compile this.compile()} generate a matcher for array.
 *
 * To change the feature, accept~ methods can be override.
 * @class
 * @example
 * const matcher = new CompilerBase().compile([
 *   'first',
 *   /^sec[oa]nd$/,
 *   str=>str==='third'?matchResult.OK:matchResult.FAIL,
 *   ['4', str=>str.toUpperCase()==='FOURTH'],
 *   ()=>matchResult.ANY_CONSUME,
 *   'end'
 * ]);
 * matcher(['first', 'second', 'third', 'fourth', 'fifth', 'end']); // => true
 */
export class CompilerBase{
    /**
     * The definition of the feature to accept an instance of the `RegExp` of this compiler.
     *
     * In the default implements, test the target by the regexp.
     * @param {RegExp} regex The regular expression to test.
     * @return {matcher} The generated matcher.
     * @example
     * new CompilerBase().acceptRegexp(/^c[au]p$/)('cup'); // => matchResult.OK
     */
    acceptRegexp(regex){
        return target=>regex.test(target) ? matchResult.OK : matchResult.FAIL;
    }

    /**
     * The definition of the feature to accept an array as a pattern of this compiler.
     *
     * In the default implements, test if any of the element in this array is matches.
     * @param {Array} array The array pattern.
     * @return {matcher} The generated matcher.
     */
    acceptArray(array){
        const compiled = array.map(pattern=>this.accept(pattern));
        return target=>compiled.some(acceptor=>acceptor(target));
    }

    /**
     * The definition of the feature to accept a string as a pattern of this compiler.
     *
     * In the default implements, test if the target is the equals to the pattern.
     * @param {string} str The string pattern.
     * @return {matcher}
     * @example
     * new CompilerBase().acceptString('first')('first'); // => matchResult.OK
     */
    acceptString(str){
        return target=>target===str ? matchResult.OK : matchResult.FAIL;
    }

    /**
     * The definition of the feature to accept a function as a pattern of this compiler.
     *
     * In the default implements, the function is resolved as a matcher.
     * @param {function} fnc The function pattern.
     * @return {matcher} The matcher.
     * @example
     * new CompilerBase().acceptFunction(
     *   str=>str==='first'?matchResult.OK:matchResult.FAIL
     * )('first'); // => matchResult.OK
     */
    acceptFunction(fnc){
        return fnc;
    }

    /**
     * The definition of the feature to accept a boolean as a pattern of this compiler.
     *
     * In the default implements, the function is resolved as a matcher.
     * @param {boolean} bool The boolean value.
     * @return {matcher} The constant matcher.
     * @example
     * new CompilerBase().acceptBoolean(true)('first'); // => matchResult.OK
     */
    acceptBoolean(bool){
        return bool? ()=>matchResult.OK : ()=>matchResult.FAIL;
    }

    /**
     * Accept a pattern and create {@link matcher} by calling other accept~ methods.
     * @param pattern The pattern.
     * @return {matcher} The generated matcher.
     * @see CompilerBase#acceptRegexp
     * @see CompilerBase#acceptArray
     * @see CompilerBase#acceptString
     * @see CompilerBase#acceptFunction
     * @see CompilerBase#acceptBoolean
     */
    accept(pattern){
        if(pattern instanceof RegExp) return this.acceptRegexp(pattern);
        if(Array.isArray(pattern)) return this.acceptArray(pattern);
        switch(typeof pattern){
            case 'string'  : return this.acceptString(pattern);
            case 'function': return this.acceptFunction(pattern);
            case 'boolean' : return this.acceptBoolean(pattern);
            default: throw new Error(`The pattern should not be the ${typeof pattern} type.`);
        }
    }

    /**
     * Compile the patterns to a matching function.
     * @param {Array} patterns The patterns
     * @return {function(*=): boolean} The generated matching function.
     */
    compile(patterns){
        const compiled = patterns.map(p=>this.accept(p));
        return targets=>match(compiled, targets);
    }
}