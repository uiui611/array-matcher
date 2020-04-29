/**
 * This file contains utilities.
 * @file
 * @author mizu-mizu
 */

/**
 * A one way linked list container.
 *
 * Create instance by calling {@link LinkedList.fromArray LinkedList.fromArray(root)}.
 * This is for shift() by O(1).
 * @class
 *
 * Create instance by the first node.
 * @param {object} node The first node.
 * @param {T} node.value The value of the node.
 * @param {object} [node.next] The next node.
 * @template T
 */
export class LinkedList {
  constructor (node) {
    this.node = node
  }

  /**
     * The current (first) node value of this list.
     * @returns {T} The node value or null (if no entry is in).
     */
  get current () { return (this.node || undefined) && this.node.value }

  /**
     * Get the first node and remove from this container.
     * @returns {T} The first node.
     */
  shift () {
    const res = this.current
    this.node = (this.node && this.node.next)
    return res
  }

  /**
     * Test if this container has any entry.
     * @returns {boolean} True if and only if this container has one or more entries.
     */
  hasValue () { return !!this.node }

  /**
     * Clone this entry.
     *
     * Note that this method is **not** copy the node object,
     *   so no one should change the node object if you copy from this method.
     *   (The feature is depends on the `node.next`.
     * @returns {LinkedList} The new linked list object.
     */
  clone () { return new LinkedList(this.node) }

  /**
     * Create instance from an array.
     * @param {T[]} arr The array to create linked list.
     * @returns {LinkedList} The created instance, contains all value of the array in order.
     */
  static fromArray (arr) {
    if (arr.length === 0) return new LinkedList(null)
    return new LinkedList(
      arr
        .map(value => ({ value }))
        .reduceRight((next, current) => Object.assign(current, { next }))
    )
  }
}
