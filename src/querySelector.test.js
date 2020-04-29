import assert from 'assert'
import { querySelector } from './querySelector'

describe('Query Selector compiler test.', () => {
  it('Name selector.', () => {
    const matcher = querySelector('target')
    assert.ok(matcher([{ tagName: 'first' }, { tagName: 'target' }]))
    assert.ok(!matcher([{ tagName: 'first' }, { tagName: 'end' }]))
  })
  it('Start from white space.', () => {
    const matcher = querySelector(' target')
    assert.ok(matcher([{ tagName: 'first' }, { tagName: 'target' }]))
    assert.ok(!matcher([{ tagName: 'first' }, { tagName: 'end' }]))
  })
  it('Class selector.', () => {
    const matcher = querySelector('.target-class')
    assert.ok(matcher([{}, { classList: ['target-class'] }]))
    assert.ok(matcher([{}, { classList: ['not-target-class', 'target-class'] }]))
    assert.ok(!matcher([{}, { classList: ['not-target-class', 'target-class'] }, {}]))
    assert.ok(!matcher([{}, { classList: ['end'] }]))
  })
  it('Id selector.', () => {
    const matcher = querySelector('#target-id')
    assert.ok(matcher([{}, { id: 'target-id' }]))
    assert.ok(!matcher([{ id: 'target-id' }, { id: 'non-target-id' }]))
  })
  it('Child separator.', () => {
    const matcher = querySelector('target>end')
    assert.ok(matcher([{ tagName: 'target' }, { tagName: 'end' }]))
    assert.ok(matcher([{ tagName: 'first' }, { tagName: 'target' }, { tagName: 'end' }]))
    assert.ok(!matcher([{ tagName: 'target' }, { tagName: 'second' }, { tagName: 'end' }]))
  })
  it('Space separator.', () => {
    const matcher = querySelector('target end')
    assert.ok(matcher([{ tagName: 'target' }, { tagName: 'end' }]))
    assert.ok(matcher([{ tagName: 'target' }, { tagName: 'second' }, { tagName: 'end' }]))
    assert.ok(!matcher([{ tagName: 'target' }, { tagName: 'second' }, { tagName: 'third' }]))
  })
  it('Name and class combined selector.', () => {
    const matcher = querySelector('target.target-class')
    assert.ok(matcher([{}, { tagName: 'target', classList: ['target-class'] }]))
    assert.ok(!matcher([{}, { tagName: 'first', classList: ['target-class'] }]))
    assert.ok(!matcher([{}, { tagName: 'target', classList: ['other-class'] }]))
  })
  it('Comma selector.', () => {
    const matcher = querySelector('target,end')
    assert.ok(matcher([{}, { tagName: 'target' }]))
    assert.ok(!matcher([{}, { tagName: 'end' }]))
    assert.ok(!matcher([{ tagName: 'target' }, { tagName: 'noTarget' }]))
  })
  it('Comma selector with white spaces.', () => {
    const matcher = querySelector('target , end')
    assert.ok(matcher([{}, { tagName: 'target' }]))
    assert.ok(!matcher([{}, { tagName: 'end' }]))
    assert.ok(!matcher([{}, { tagName: 'noTarget' }]))
  })
})
