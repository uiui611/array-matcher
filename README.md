# @mizu-mizu/array-matcher

The matcher JavaScript library for array.

This script works in modern browsers and Node.JS .

## Installation
In a browser:

Download the file as 'array-matcher.mjs' from 
[github | master](https://raw.githubusercontent.com/uiui611/array-matcher/master/dist/array-matcher.mjs)
next to the html, and insert `import` in the script tag.
```html
<script type="module">
    import * as arrayMatcher from './array-matcher.mjs';
</script>
```

In a Node.JS:
```
npm install --save @mizu-mizu/array-matcher
```
```javascript
const arrayMatcher = require('@mizu-mizu/array-matcher');
```

## Features
Some tiny matcher generators are provided, and also, you can implement your own matcher.
### Glob matching (string array)
```javascript
import {glob} from './array-matcher.mjs';
const matcher = glob('root/**/*.txt');
matcher(['root', 'parent', 'child.txt']);  // => true
matcher(['root', 'parent', 'child.json']); // => false
```
Supports:
- `**` : match 0 or more items.
- `*`  : match 0 or more characters.
- `?`  : match any single character.
- `[abc]` : match 'a' or 'b' or 'c'
- `[a-z]` : match 'a' to 'z'

### Css-like matching (object array)
```javascript
import {querySelector} from './array-matcher.mjs';
const matcher = querySelector('#target');
matcher([
    {tagName: 'body'},
    {tagName: 'main'},
    {tagName: 'span', id:'target'}
]); // => true
```
Supports:
- `tagname`: match whose `tagName` property is the same to 'tagname'.
- `.class-selector`: match whose classList contains 'class-selector' as an array, or it's contains('class-selector') method returns true.
- `#id` : match whose `id` property is the same to 'id'.
- `>` : separator to it's child.
- ` ` : separator to it's descendant.
- `,` : separator match for either left part or right part.

### Create your own matcher
Using matcher functions list:
```javascript
import {matchResult, match} from './array-matcher.mjs';
/*
 * Prepare an array of matching functions.
 * This example matches all array whose first element is 'first'
 *   (not depends on it's letter case).
 */
const matcherList = [
    str=>str.toLowerCase() === 'first' ? matchResult.OK : matchResult.FAIL,
    ()=>matchResult.ANY_CONSUME
];
match(matcherList, ['first', 'second']); // => true
match(matcherList, ['FIRST', 'SECOND']); // => true
match(matcherList, ['illegal', 'first', 'second']); // => false
```

Implements the CompilerBase class:
```javascript
import {CompilerBase, matchResult} from './array-matcher.mjs';
/*
 * Implements the CompilerBase and override some methods.
 */
class OriginalMatcherCompiler extends CompilerBase{
    /*
     * If you provide a string in the argument array of this#compile(),
     *   this method is called.
     * This method should return a matching function.
     */
    acceptString(str) {
        /* To support glob-like recursive match. */
        if(str==='**') return ()=>matchResult.ANY_CONSUME;
        return target=>(target&& target.toLowerCase())===str 
                ? matchResult.OK : matchResult.FAIL;
    }
}
const matcher = new OriginalMatcherCompiler().compile(
    ['first', '**']
);
matcher(['first', 'second']); // => true
matcher(['FIRST', 'SECOND']); // => true
matcher(['illegal', 'first', 'second']); // => false
```