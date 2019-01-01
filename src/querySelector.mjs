/**
 * This file contains a compiler for matcher to resolve css-like query selector (tiny implements).
 *
 * Note that this is not a complete implements of the css query selector.
 *   (This is a tiny program of the query.)
 * @file
 * @author mizu-mizu
 */
import {ANY_CONSUME_MATCHER, CompilerBase, matchResult} from "./matcher";
import {LinkedList} from "./util";

const charType = Object.freeze({
    WHITE_SPACE: Symbol('WHITE_SPACE'),
    WORD_CHAR  : Symbol('WORD_CHAR'),
    OPERATOR   : Symbol('OPERATOR'),
    QUOTE      : Symbol('QUOTE'),
    UNKNOWN    : Symbol('UNKNOWN')
});
const charTable = new Array(0x80).fill(0)
    .map(()=>charType.UNKNOWN)
    .map((v, i)=>/\s/         .test(String.fromCharCode(i)) ? charType.WHITE_SPACE : v)
    .map((v, i)=>/[\w-]/      .test(String.fromCharCode(i)) ? charType.WORD_CHAR   : v)
    .map((v, i)=>/["'`]/      .test(String.fromCharCode(i)) ? charType.QUOTE       : v)
    .map((v, i)=>/[.#[\]+~:>]/.test(String.fromCharCode(i)) ? charType.OPERATOR    : v);

function getCharType(ch){
    if(!ch) return charType.WHITE_SPACE;
    const code = ch.charCodeAt(0);
    return code >= 0x80 ? charType.WORD_CHAR : charTable[code];
}

/**
 * Split the input for tokens as css query selector.
 * @param {string} pattern The input string.
 * @return {string[]} The tokens.
 * @private
 */
function tokenize(pattern){
    let index = 0;
    const res = [];
    function escape(){
        if(pattern[index++]==='\\') index++;
        return pattern[index-1];
    }
    function literal(){
        const literalCh = pattern[index++];
        const chars = [literalCh];
        let ch;
        while((ch=escape())!==literalCh){
            if(index>=pattern.length) throw new Error(`The end of the literal required (${literalCh} in ${pattern})`);
            chars.push(ch);
        }
        chars.push(ch);
        res.push(chars.join());
    }
    function whileThisType(){
        const type = getCharType(pattern[index]);
        const from = index;
        while(getCharType(pattern[++index])===type);
        res.push(pattern.substring(from, index));
    }
    while(index<pattern.length){
        switch(getCharType(pattern[index])){
            case charType.WORD_CHAR:
            case charType.WHITE_SPACE:
                whileThisType();
                break;
            case charType.OPERATOR:
                res.push(pattern[index++]);
                break;
            case charType.QUOTE:
                literal();
                break;
            default:
                throw new Error(`Invalid character '${pattern[index]}' on '${pattern}' .`);
        }
    }
    if(getCharType(res[0][0])===charType.WHITE_SPACE) res.shift();
    if(getCharType(res[res.length-1][0])===charType.WHITE_SPACE) res.pop();
    return res;
}

/**
 * The parser for query selector string.
 * @class
 * @param {string} input The input for the parser.
 * @private
 * @example
 * const res = new QueryParser('root>child').parse();
 * match(res,[ {tagName:'root'},{tagName:'child'} ]); // => true
 */
class QueryParser{
    constructor(input){
        this.tokens = LinkedList.fromArray(tokenize(input));
        this.result = [ANY_CONSUME_MATCHER];
    }
    classSelector(){
        const {tokens, result} = this;
        if(tokens.current!=='.') return false;
        tokens.shift();
        const label = tokens.shift();
        result.push(obj=>{
            const list = obj.classList;
            if(!list) return matchResult.FAIL;
            if(Array.isArray(list)) return list.indexOf(label) >= 0 ? matchResult.OK : matchResult.FAIL;
            else if(list.contains) return list.contains(label) ? matchResult.OK : matchResult.FAIL;
            else return matchResult.FAIL;
        });
        return true;
    }
    idSelector(){
        const {tokens, result} = this;
        if(tokens.current !== '#') return false;
        tokens.shift();
        const label = tokens.shift();
        result.push(obj=>obj.id===label?matchResult.OK : matchResult.FAIL);
        return true;
    }
    nameSelector(){
        const {tokens, result} = this;
        if(!tokens.current) return false;
        if(getCharType(tokens.current[0])!==charType.WORD_CHAR) return false;
        const label = tokens.shift();
        result.push(obj=>obj.tagName===label?matchResult.OK : matchResult.FAIL);
        return true;
    }
    wildcard(){
        const {tokens, result} = this;
        if(tokens.current!=='*') return false;
        tokens.shift();
        result.push(()=>matchResult.OK);
        return true;
    }
    space(){
        const {tokens, result} = this;
        if(getCharType(tokens.current[0])!==charType.WHITE_SPACE) return false;
        tokens.shift();
        result.push(ANY_CONSUME_MATCHER);
        return true;
    }
    childSeparator(){
        if(this.tokens.current !== '>') return false;
        this.tokens.shift();
        return true;
    }
    selector(){
        const res =(
            this.idSelector()
            || this.classSelector()
            || this.nameSelector()
            || this.wildcard()
        );
        if(!res) return false;
        while(this.filter());
        return true;
    }
    filter(){
        if(!this.selector()) return false;
        const pre = this.result.pop();
        const post = this.result.pop();
        this.result.push(obj=>pre(obj) && post(obj));
        return true;
    }
    separator(){
        return(
            this.space()
            || this.childSeparator()
        );
    }
    parse(){
        if(!this.selector()) {
            throw new Error(`Required selector before '${this.tokens.shift() || '\\0'}'`);
        }
        while(this.tokens.hasValue()){
            if(!this.separator()){
                throw new Error(`Required separator before '${this.tokens.shift() || '\\0'}'`);
            }
            if(!this.selector()) {
                throw new Error(`Required selector before '${this.tokens.shift() || '\\0'}'`);
            }
        }
        return this.result;
    }
}

/**
 * The implements of the {@link CompilerBase} for object array.
 * @class
 * @private
 */
class ObjectCompiler extends CompilerBase{
    getName(o){ return o.tagName }
    acceptRegexp(regexp) {
        const origin = super.acceptRegexp(regexp);
        return obj => origin(this.getName(obj));
    }
    acceptString(string) {
        const origin = super.acceptString(string);
        return obj => origin(this.getName(obj));
    }
}

/**
 * The compiler for css-like query selector.
 * @param {string|Array} query The query or array of the query.
 * @return {function} The matching function.<br>
 *   The function accept an array of the object, and returns true (if match) or false.
 * @example
 * const matcher = querySelector('root>child');
 * matcher([{tagName:'root'},{tagName:'child'}]); // => true
 * const matcher2 = querySelector('.container target');
 * matcher2([
 *   {},
 *   {classList:['container']},
 *   {},
 *   {tagName: 'target'}
 * ]); // => true
 */
export function querySelector(query){
    if(typeof query === 'string') query = [query];
    query = query.reduce((arr, current)=>{
        if(typeof current === 'string') {
            new QueryParser(current).parse().forEach(n=>arr.push(n));
        }
        else arr.push(current);
        return arr;
    }, []);
    return new ObjectCompiler().compile(query);
}