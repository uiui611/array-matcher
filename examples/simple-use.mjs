import {glob, querySelector} from '../dist/array-matcher';
import assert from 'assert';

describe('GLOB MATCHING EXAMPLES', ()=>{

    /*
     * The wildcard character '*' matches any number of characters.
     */
    it('Use wild card.', ()=>{
        const matcher = glob('first/second/*.txt');
        assert.ok(matcher(['first', 'second', 'third.txt']));
    });
    /*
     * The single character matcher '?' matches any single character.
     */
    it('Use single character matcher.', ()=>{
        const matcher = glob('?irst/secon?/third.tx?');
        assert.ok(matcher(['first', 'second', 'third.txt']));
    });
});
describe('CSS-LIKE QUERY SELECTOR EXAMPLES', ()=>{
    /*
     * The id selector '#the_id' matches object whose property id equals to 'the_id'.
     */
    it('ID selector', ()=>{
        const matcher = querySelector('#target');
        assert.ok(matcher([
            {tagName: 'body'},
            {tagName: 'main'},
            {tagName: 'span', id:'target'}
        ]));
    });
    it('Class selector.', ()=>{
        const matcher = querySelector('#target-id .target-class');
        assert.ok(matcher([
            {tagName: 'body'},
            {tagName: 'main', id: 'target-id'},
            {tagName: 'article'},
            {tagName: 'span', classList: ['active', 'target-class']}
        ]));
    })
});