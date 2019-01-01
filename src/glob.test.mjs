import {glob} from './glob';
import assert from 'assert';

describe('Glob compiler test.', ()=>{
    it('String only path.', ()=>{
        const matcher = glob('first/second');
        assert.ok(matcher(['first', 'second']));
        assert.ok(!matcher(['first', 'third']));
    });
    it('Wild card.', ()=>{
        const matcher = glob('first/*cond');
        assert.ok(matcher(['first', 'second']));
        assert.ok(!matcher(['first', 'third']));
        assert.ok(!matcher(['first', 'second', 'third']));
    });
    it('Single char wild card.', ()=>{
        const matcher = glob('first/sec?nd');
        assert.ok(matcher(['first', 'second']));
        assert.ok(matcher(['first', 'secand']));
        assert.ok(!matcher(['first', 'third']));
    });
    it('Multi character match.', ()=>{
        const matcher = glob('first/sec[oaOA]nd');
        assert.ok(matcher(['first', 'second']));
        assert.ok(matcher(['first', 'secand']));
        assert.ok(!matcher(['first', 'third']));
    });
    it('Character range match.', ()=>{
        const matcher = glob('first/sec[a-z]nd');
        assert.ok(matcher(['first', 'second']));
        assert.ok(matcher(['first', 'secand']));
        assert.ok(!matcher(['first', 'secOnd']));
    });
    it('Multi range match.', ()=>{
        const matcher = glob('first/sec[a-zA-Z]nd');
        assert.ok(matcher(['first', 'second']));
        assert.ok(matcher(['first', 'secOnd']));
        assert.ok(!matcher(['first', 'sec1nd']));
    });
    it('Multi directory matcher ("**").', ()=>{
        const matcher = glob('first/**/end');
        assert.ok(matcher(['first', 'end']));
        assert.ok(matcher(['first', 'second', 'end']));
        assert.ok(!matcher(['first', 'second']));
    });
});