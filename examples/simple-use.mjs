import {glob, querySelector} from '../dist/array-matcher';
import assert from 'assert';

describe('GLOB MATCHING EXAMPLE', ()=>{
    it('Use wild card.', ()=>{
        const matcher = glob('first/second/*.txt');
        assert.ok(matcher(['first', 'second', 'third.txt']));
    });
});
describe('CSS-LIKE QUERY SELECTOR EXAMPLE', ()=>{
    it('ID selector', ()=>{
        const matcher = querySelector('#target');
        assert.ok(matcher([
            {tagName: 'body'},
            {tagName: 'main'},
            {tagName: 'span', id:'target'}
        ]));
    });
});