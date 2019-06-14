
/*
 * @mizu-mizu/array-matcher.js VERSION 1.1.2
 * Released under the MIT License.
 *   https://github.com/uiui611/array-matcher/blob/master/LICENSE
 */

class LinkedList{
constructor(node){
this.node = node;
}
get current(){ return (this.node || undefined) && this.node.value }
shift(){
const res = this.current;
this.node = (this.node && this.node.next);
return res;
}
hasValue(){ return !!this.node }
clone(){ return new LinkedList(this.node); }
static fromArray(arr){
if(arr.length===0) return new LinkedList(null);
return new LinkedList(
arr
.map(value=>({value}))
.reduceRight((next, current)=>Object.assign(current,{next}))
);
}
}

const matchResult = Object.freeze({
OK: Symbol('OK'),
FAIL: false,
NO_CONSUME: Symbol('NO CONSUME'),
NO_OR_ONE_CONSUME: Symbol('NO OR ONE CONSUME'),
ANY_CONSUME: Symbol('ANY CONSUME')
});
const MATCH_OR_SYMBOL = Symbol('MATCH OR SYMBOL');
const ANY_CONSUME_MATCHER = () => matchResult.ANY_CONSUME;
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
function match(pattern, target){
const patternSplit = [];
let index = 0;
let from = 0;
while(index<pattern.length){
if(pattern[index]===MATCH_OR_SYMBOL){
if(index>from){
patternSplit.push(pattern.slice(from, index));
}
from = index+1;
}
index++;
}
if(from<=pattern.length-1) patternSplit.push(pattern.slice(from));
for(let ps of patternSplit){
if(matchToLinkedList(
LinkedList.fromArray(ps),
LinkedList.fromArray(target)
)) return true;
}
return false;
}
class CompilerBase{
acceptRegexp(regex){
return target=>regex.test(target) ? matchResult.OK : matchResult.FAIL;
}
acceptArray(array){
const compiled = array.map(pattern=>this.accept(pattern));
return target=>compiled.some(acceptor=>acceptor(target));
}
acceptString(str){
return target=>target===str ? matchResult.OK : matchResult.FAIL;
}
acceptFunction(fnc){
return fnc;
}
acceptBoolean(bool){
return bool? ()=>matchResult.OK : ()=>matchResult.FAIL;
}
accept(pattern){
if(pattern instanceof RegExp) return this.acceptRegexp(pattern);
if(Array.isArray(pattern)) return this.acceptArray(pattern);
if(pattern===MATCH_OR_SYMBOL) return pattern;
switch(typeof pattern){
case 'string'  : return this.acceptString(pattern);
case 'function': return this.acceptFunction(pattern);
case 'boolean' : return this.acceptBoolean(pattern);
default: throw new Error(`The pattern should not be the ${typeof pattern} type.`);
}
}
compile(patterns){
const compiled = patterns.map(p=>this.accept(p));
return targets=>match(compiled, targets);
}
}

function tokenize(glob){
const res = [];
let index = 0;
function bracket(){
const from = index;
while(glob[++index]!==']'){
if(index>=glob.length) throw new Error('The right bracket "]" is not found. > ' + glob);
}
res.push(glob.substring(from, ++index));
}
while(index<glob.length){
if(glob[index]==='[') bracket();
else res.push(glob[index++]);
}
return res;
}
function charSelector(pattern){
const allowed = [];
let index = 0;
function range(){
const from = pattern.charCodeAt(index);
const to = pattern.charCodeAt(index+=2);
allowed.push(ch=>from<=ch.charCodeAt(0) && ch.charCodeAt(0)<=to);
index++;
}
while(index<pattern.length){
if(pattern.length>index+2&&pattern[index+1]==='-') range();
else{
const p = pattern[index++];
allowed.push(ch=>ch===p);
}
}
return ch=>allowed.some(fnc=>fnc(ch))? matchResult.OK : matchResult.FAIL;
}
class GlobCompiler extends CompilerBase{
acceptString(str) {
if(str==='**') return ANY_CONSUME_MATCHER;
const patterns = tokenize(str)
.map(p=>{
if(p==='*') return ANY_CONSUME_MATCHER;
if(p==='?') return ch=>ch ? matchResult.OK : matchResult.FAIL;
if(p[0]==='[') return charSelector(p.slice(1, -1));
return ch=>p===ch ? matchResult.OK : matchResult.FAIL;
});
return target=>match(patterns, target.split('')) ? matchResult.OK : matchResult.FAIL;
}
}
function glob(globs){
if(typeof globs === 'string') globs = globs.split('/');
return new GlobCompiler().compile(globs);
}

const charType = Object.freeze({
WHITE_SPACE: Symbol('WHITE_SPACE'),
WORD_CHAR  : Symbol('WORD_CHAR'),
OPERATOR   : Symbol('OPERATOR'),
QUOTE      : Symbol('QUOTE'),
UNKNOWN    : Symbol('UNKNOWN')
});
const charTable = new Array(0x80).fill(charType.UNKNOWN)
.map((v, i)=>/\s/         .test(String.fromCharCode(i)) ? charType.WHITE_SPACE : v)
.map((v, i)=>/[\w-]/      .test(String.fromCharCode(i)) ? charType.WORD_CHAR   : v)
.map((v, i)=>/["'`]/      .test(String.fromCharCode(i)) ? charType.QUOTE       : v)
.map((v, i)=>/[.#[\]+~:>,]/.test(String.fromCharCode(i)) ? charType.OPERATOR   : v);
function getCharType(ch){
if(!ch) return charType.WHITE_SPACE;
const code = ch.charCodeAt(0);
return code >= 0x80 ? charType.WORD_CHAR : charTable[code];
}
function tokenize$1(pattern){
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
class QueryParser{
constructor(input){
this.tokens = LinkedList.fromArray(tokenize$1(input));
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
if(Array.isArray(list)) return list.includes(label) ? matchResult.OK : matchResult.FAIL;
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
if(tokens.current===',') return false;
result.push(ANY_CONSUME_MATCHER);
return true;
}
childSeparator(){
if(this.tokens.current !== '>') return false;
this.tokens.shift();
return true;
}
commaSeparator(){
const {tokens, result} = this;
if(tokens.current!==',') return false;
result.push(MATCH_OR_SYMBOL);
tokens.shift();
if(getCharType(tokens.current)===charType.WHITE_SPACE) tokens.shift();
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
|| this.commaSeparator()
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
function querySelector(query){
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

export { glob, querySelector, matchResult, MATCH_OR_SYMBOL, ANY_CONSUME_MATCHER, match, CompilerBase };
