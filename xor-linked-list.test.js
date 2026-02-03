const XorLinkedList = require("./xor-linked-list");
const _ = require("underscore");

test("an empty list has size equal to 0", () => expect(new XorLinkedList()).toHaveLength(0));

test("an empty list has no first element", () =>
  expect(new XorLinkedList().first()).toBe(XorLinkedList.NOT_FOUND)
);

test("an empty list has no last element", () =>
  expect(new XorLinkedList().last()).toBe(XorLinkedList.NOT_FOUND)
);

test("isEmpty() returns true if the list is empty", () =>
  expect(new XorLinkedList().isEmpty()).toBeTruthy()
);

test("last() returns the last element address", () => {
  const list = new XorLinkedList();
  list.append(0);
  list.append(1);
  list.append(2);
  expect(list.last()).toBe(XorLinkedList.ELEMENT_SIZE * 2);
});

test("first() returns the first element address", () => {
  const list = new XorLinkedList();
  list.prepend(0);
  list.prepend(1);
  list.prepend(2);
  expect(list.first()).toBe(XorLinkedList.ELEMENT_SIZE * 2);
});

test("ensureCapacity() doesn't change the capacity until it's necessary", () => {
  const list = new XorLinkedList();
  expect(list.size).toBe(0);
  expect(list.capacity).toBe(XorLinkedList.INITIAL_CAPACITY);
  _.times(XorLinkedList.INITIAL_CAPACITY, () => list.allocate(0, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND));
  expect(list.size).toBe(XorLinkedList.INITIAL_CAPACITY);
  expect(list.capacity).toBe(XorLinkedList.INITIAL_CAPACITY);
});

test("ensureCapacity() doubles the capacity for the sake of 𝛩(1)", () => {
  const list = new XorLinkedList();
  _.times(XorLinkedList.INITIAL_CAPACITY + 1, () => list.allocate(0, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND));
  expect(list.capacity).not.toBe(XorLinkedList.INITIAL_CAPACITY);
  expect(list.capacity / XorLinkedList.INITIAL_CAPACITY).toBeCloseTo(2, 0);
  _.times(XorLinkedList.INITIAL_CAPACITY + 1, () => list.allocate(0, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND));
  expect(list.capacity / XorLinkedList.INITIAL_CAPACITY).toBeCloseTo(4, 0);
});

test("internal buffer has the proper size in bytes", () => {
  const multiplier = Uint32Array.BYTES_PER_ELEMENT * XorLinkedList.ELEMENT_SIZE;
  const list = new XorLinkedList();
  expect(list.buffer.byteLength).toBe(XorLinkedList.INITIAL_CAPACITY * multiplier);
  _.times(XorLinkedList.INITIAL_CAPACITY, () => list.allocate(0, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND));
  expect(list.buffer.byteLength).toBe(list.capacity * multiplier);
});

test("allocate() increases the list size", () => {
  const list = new XorLinkedList();
  list.allocate(0, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND);
  expect(list.size).toBe(1);
  list.allocate(1, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND);
  expect(list.size).toBe(2);
});

test("allocate() stores the value in the internal buffer", () => {
  const list = new XorLinkedList();
  expect(list.buffer).not.toContain(42);
  list.allocate(42, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND);
  expect(list.buffer).toContain(42);
});

test("isEmpty() returns false if the list is not empty", () => {
  const list = new XorLinkedList();
  list.append(0);
  expect(list.isEmpty()).toBeFalsy();
});

test("append() increases the list size", () => {
  const list = new XorLinkedList();
  list.append(0);
  expect(list).toHaveLength(1);
  list.append(1);
  expect(list).toHaveLength(2);
});

test("append(value) stores the value", () => {
  const list = new XorLinkedList();
  expect(Array.from(list)).toEqual([]);
  list.append(42);
  expect(Array.from(list)).toEqual([42]);
});

test("list can store 32 unsigned integers", () => {
  const list = new XorLinkedList();
  list.append(0xFFFF_FFFF);
  expect(Array.from(list)).toEqual([0xFFFF_FFFF]);
  list.append(0xFFFF_FFFF + 1);
  expect(Array.from(list)).toEqual([0xFFFF_FFFF, 0]);
  list.append(0xFFFF_FFFF + 2);
  expect(Array.from(list)).toEqual([0xFFFF_FFFF, 0, 1]);
  list.append(-1);
  expect(Array.from(list)).toEqual([0xFFFF_FFFF, 0, 1, 0xFFFF_FFFF]);
});

test("append(value) preserves the order", () => {
  const list = new XorLinkedList();
  list.append(0);
  list.append(2);
  list.append(1);
  expect(Array.from(list)).toEqual([0, 2, 1]);
});

test("append(value) can store multiple copies of the same value", () => {
  const list = new XorLinkedList();
  list.append(0);
  list.append(1);
  list.append(0);
  list.append(0);
  expect(Array.from(list)).toEqual([0, 1, 0, 0]);
});

test("append(value) returns different non-empty references", () => {
  const list = new XorLinkedList();
  const r1 = list.append(0);
  const r2 = list.append(0);
  expect(r1).not.toEqual(r2);
  expect(r1).not.toBe(XorLinkedList.NOT_FOUND);
  expect(r2).not.toBe(XorLinkedList.NOT_FOUND);
});

test("append(value) can overflow the list", () => {
  const list = new XorLinkedList();
  _.times(XorLinkedList.MAX_CAPACITY, () => list.append(0));
  expect(list.length).toBe(XorLinkedList.MAX_CAPACITY);
  expect(() => list.append(0)).toThrow("memory");
});

test("prepend(value) stores the value", () => {
  const list = new XorLinkedList();
  expect(Array.from(list)).toEqual([]);
  list.prepend(42);
  expect(Array.from(list)).toEqual([42]);
});

test("prepend(value) reverses the order", () => {
  const list = new XorLinkedList();
  list.prepend(2);
  list.prepend(1);
  list.prepend(0);
  expect(Array.from(list)).toEqual([0, 1, 2]);
});

test("prepend(value) can store multiple copies of the same value", () => {
  const list = new XorLinkedList();
  list.prepend(0);
  list.prepend(1);
  list.prepend(0);
  list.prepend(0);
  expect(Array.from(list)).toEqual([0, 0, 1, 0]);
});

test("calls on an empty list give the same results for prepend(value) and append(value)", () => {
  const list1 = new XorLinkedList(), list2 = new XorLinkedList();
  list1.prepend(42);
  list2.append(42);
  expect(Array.from(list1)).toEqual(Array.from(list2));
});

test("modifications by prepend(value) and append(value) work properly", () => {
  const list = new XorLinkedList();
  list.prepend(1);
  list.append(2);
  list.prepend(0);
  list.append(3);
  expect(Array.from(list)).toEqual([0, 1, 2, 3]);
});

test("prepend(value) returns different non-empty references", () => {
  const list = new XorLinkedList();
  const r1 = list.prepend(0);
  const r2 = list.prepend(0);
  expect(r1).not.toEqual(r2);
  expect(r1).not.toBe(XorLinkedList.NOT_FOUND);
  expect(r2).not.toBe(XorLinkedList.NOT_FOUND);
});

test("prepend(value) and append(value) return different non-empty references", () => {
  const list = new XorLinkedList();
  const r1 = list.append(0);
  const r2 = list.prepend(0);
  expect(r1).not.toEqual(r2);
  expect(r1).not.toBe(XorLinkedList.NOT_FOUND);
  expect(r2).not.toBe(XorLinkedList.NOT_FOUND);
});

test("prepend(value) can overflow the list", () => {
  const list = new XorLinkedList();
  _.times(XorLinkedList.MAX_CAPACITY, () => list.prepend(0));
  expect(list.length).toBe(XorLinkedList.MAX_CAPACITY);
  expect(() => list.prepend(0)).toThrow("memory");
});

test("checkAddress(address) accepts NOT_FOUND", () => {
  expect(() => new XorLinkedList().checkAddress(XorLinkedList.NOT_FOUND)).not.toThrow("address");
});

test("checkAddress(0) fails for an empty list", () => {
  expect(() => new XorLinkedList().checkAddress(0)).toThrow("address");
});

test("checkAddress(0) doesn't fail for a one-element list", () => {
  const list = new XorLinkedList();
  list.append(0);
  expect(() => list.checkAddress(0)).not.toThrow();
});

test("checkAddress(2) fails for a one-element list", () => {
  const list = new XorLinkedList();
  list.append(0);
  expect(() => list.checkAddress(XorLinkedList.ELEMENT_SIZE)).toThrow("address");
});

test("checkAddress(address) fails for invalid addresses", () => {
  const list = new XorLinkedList();
  list.append(0);
  expect(() => list.checkAddress(1)).toThrow("address");
  expect(() => list.checkAddress(42)).toThrow("address");
});

test("append(value) returns proper addresses", () => {
  const list = new XorLinkedList();
  const ref0 = list.append(37);
  const ref1 = list.append(42);
  expect(ref0).toEqual(0);
  expect(ref1).toEqual(XorLinkedList.ELEMENT_SIZE);
});

test("prepend(value) returns proper addresses", () => {
  const list = new XorLinkedList();
  const ref0 = list.prepend(37);
  const ref1 = list.prepend(42);
  expect(ref0).toEqual(0);
  expect(ref1).toEqual(XorLinkedList.ELEMENT_SIZE);
});

test("get(address) reads values", () => {
  const list = new XorLinkedList();
  expect(list.get(list.prepend(37))).toBe(37);
  expect(list.get(list.append(42))).toBe(42);
});

test("it's possible to insert an element into an empty list", () => {
  const list = new XorLinkedList();
  list.insertBetween(0, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND);
  expect(Array.from(list)).toEqual([0]);
});

test("insertion before the first element prepends an element", () => {
  const list = new XorLinkedList();
  const ref = list.insertBetween(0, XorLinkedList.NOT_FOUND, list.prepend(1));
  expect(Array.from(list)).toEqual([0, 1]);
  expect(ref).toEqual(XorLinkedList.ELEMENT_SIZE);
});

test("insertion after the last element appends an element", () => {
  const list = new XorLinkedList();
  const ref = list.insertBetween(1, list.append(0), XorLinkedList.NOT_FOUND);
  expect(Array.from(list)).toEqual([0, 1]);
  expect(ref).toEqual(XorLinkedList.ELEMENT_SIZE);
});

test("insertBetween(value, a, b) inserts in the proper place", () => {
  const list = new XorLinkedList();
  const a = list.append(0);
  const b = list.append(2);
  list.insertBetween(1, a, b);
  expect(Array.from(list)).toEqual([0, 1, 2]);
});

test("insertBetween(value, a, b) inserts in the proper place in reverse scenario", () => {
  const list = new XorLinkedList();
  const a = list.append(2);
  const b = list.prepend(0);
  list.insertBetween(1, b, a);
  expect(Array.from(list)).toEqual([0, 1, 2]);
});

test("insertBetween(value, a, b) calls can be chained", () => {
  const list = new XorLinkedList();
  list.insertBetween(0, XorLinkedList.NOT_FOUND, list.insertBetween(2, list.insertBetween(1, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND), XorLinkedList.NOT_FOUND));
  expect(Array.from(list)).toEqual([0, 1, 2]);
});

test("insertBetween(value, a, b) works in complex scenarios", () => {
  const list = new XorLinkedList();
  const r2 = list.insertBetween(2, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND);
  expect(Array.from(list)).toEqual([2]);
  const r0 = list.insertBetween(0, XorLinkedList.NOT_FOUND, r2);
  expect(Array.from(list)).toEqual([0, 2]);
  const r4 = list.insertBetween(4, r2, XorLinkedList.NOT_FOUND);
  expect(Array.from(list)).toEqual([0, 2, 4]);
  const r1 = list.insertBetween(1, r0, r2);
  expect(Array.from(list)).toEqual([0, 1, 2, 4]);
  const r3 = list.insertBetween(3, r2, r4);
  expect(Array.from(list)).toEqual([0, 1, 2, 3, 4]);
});

test("insertBetween(value, a, b) takes the order of addresses into account", () => {
  const list1 = new XorLinkedList(), list2 = new XorLinkedList();
  list1.insertBetween(1, list1.append(0), list1.append(2));
  list2.insertBetween(1, list2.append(2), list2.append(0));
  expect(Array.from(list1)).toEqual([0, 1, 2]);
  expect(Array.from(list2)).not.toEqual([0, 1, 2]);
});

test("insertBetween, append and prepend can work together in complex scenarios", () => {
  const list = new XorLinkedList();
  const r2 = list.insertBetween(2, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND);
  const r0 = list.prepend(0);
  const r4 = list.append(4);
  const r1 = list.insertBetween(1, r0, r2);
  const r3 = list.insertBetween(3, r2, r4);
  expect(Array.from(list)).toEqual([0, 1, 2, 3, 4]);
});

test("insertBetween works in a complex scenario", () => {
  const list = new XorLinkedList();
  _.times(10, (i) => { list.prepend(1000 - i); });
  let a = list.last();
  let b = list.append(90000);
  _.times(10, (i) => { list.append(100000 + i); });
  _.times(20, (i) => {
    a = list.insertBetween(i + 10000, a, b);
    b = list.insertBetween(50000 - i, a, b);
  });
  expect(list.size).toBe(10 + 10 + 1 + 20 * 2);
  const result = Array.from(list);
  _.times(result.length - 1, (i) => expect(result[i]).toBeLessThan(result[i + 1]));
});

test("addressOf(value) returns NOT_FOUND for an empty list", () => {
  expect(new XorLinkedList().addressOf(0)).toBe(XorLinkedList.NOT_FOUND);
});

test("addressOf(value) can find the first element", () => {
  const list = new XorLinkedList();
  list.append(0); list.append(1); list.append(2); list.append(3);
  expect(list.addressOf(0)).toEqual(0);
});

test("addressOf(value) can find the last element", () => {
  const list = new XorLinkedList();
  list.append(0); list.append(1);
  expect(list.addressOf(1)).toEqual(XorLinkedList.ELEMENT_SIZE);
});

test("addressOf(value) can find all the elements", () => {
  const list = new XorLinkedList();
  _.times(10, (i) => list.append(i));
  _.times(10, (i) => expect(list.addressOf(i)).toEqual(i * XorLinkedList.ELEMENT_SIZE));
});

test("addressOf(value) doesn't find an element not in the list", () => {
  const list = new XorLinkedList();
  _.times(10, (i) => {
    if (i != 5) list.append(i);
  });
  expect(new XorLinkedList().addressOf(5)).toBe(XorLinkedList.NOT_FOUND);
});

test("reverse() works on an empty list", () => {
  expect(Array.from(new XorLinkedList().reverse())).toEqual([]);
});

test("two reverse() cancel out", () => {
  const list = new XorLinkedList();
  list.append(1);
  list.prepend(0);
  list.append(2);
  expect(Array.from(list.reverse().reverse())).toEqual(Array.from(list));
});

test("reverse() works on short lists", () => {
  const list1 = new XorLinkedList();
  list1.append(0);
  list1.reverse();
  expect(Array.from(list1)).toEqual([0]);
  const list2 = new XorLinkedList();
  list2.prepend(1);
  list2.prepend(0);
  expect(Array.from(list2.reverse())).toEqual([1, 0]);
});

test("append(value) calls can be exchanged with prepend(value) calls followed by reverse()", () => {
  const list1 = new XorLinkedList(), list2 = new XorLinkedList();
  _.times(10, (i) => {
    if (i % 2 == 0) {
      list1.append(i);
      list2.prepend(i);
    } else {
      list2.append(i);
      list1.prepend(i);
    }
  });
  expect(Array.from(list1)).toEqual(Array.from(list2.reverse()));
});

test("reverse() works in complex scenarios", () => {
  const list = new XorLinkedList();
  const r2 = list.insertBetween(2, XorLinkedList.NOT_FOUND, XorLinkedList.NOT_FOUND);
  const r0 = list.prepend(0);
  const r4 = list.append(4);
  const r1 = list.insertBetween(1, r0, r2);
  const r3 = list.insertBetween(3, r2, r4);
  expect(Array.from(list.reverse())).toEqual([4, 3, 2, 1, 0]);
});

test("reverse() is fast", () => {
  const list = new XorLinkedList();
  _.times(1000, (i) => {
    list.append(i);
  });
  _.times(5000, () => list.reverse().reverse());
}, 10);

test("prepend(value) is fast", () => {
  const list = new XorLinkedList();
  _.times(5000, (i) => {
    list.prepend(i);
  });
}, 10);

test("append(value) is fast", () => {
  const list = new XorLinkedList();
  _.times(5000, (i) => {
    list.append(i);
  });
}, 10);

test("insertBetween(value, a, b) is fast", () => {
  const list = new XorLinkedList();
  _.times(1000, (i) => { list.prepend(1000 - i); });
  let a = list.last();
  let b = list.append(90000);
  _.times(1000, (i) => { list.append(100000 + i); });
  _.times(2500, (i) => {
    a = list.insertBetween(i + 10000, a, b);
    b = list.insertBetween(50000 - i, a, b);
  });
  expect(list.size).toBe(1000 + 1000 + 1 + 2500 * 2);
}, 10);

test("internal buffer size is limited by 2*capacity", () => {
  const list = new XorLinkedList();
  expect(XorLinkedList.INITIAL_CAPACITY).toBeLessThanOrEqual(15);
  expect(XorLinkedList.ELEMENT_SIZE).toBe(2);
  _.times(10000, (i) => {
    list.append(i);
    const limit = 2 * XorLinkedList.ELEMENT_SIZE * Uint32Array.BYTES_PER_ELEMENT * (i + 1);
    if (i > XorLinkedList.INITIAL_CAPACITY) expect(list.buffer.buffer.byteLength).toBeLessThanOrEqual(limit);
  });
});