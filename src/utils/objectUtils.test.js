/**
 * objectUtils unit tesztek (Vitest)
 */

import { describe, it, expect } from 'vitest';
import {
  deepClone,
  deepMerge,
  pick,
  omit,
  renameKeys,
  isEmpty,
  isEqual,
  filterObject,
  mapValues,
  mapKeys,
  toPairs,
  fromPairs,
  invert,
  getDepth,
  get,
  set,
  stringify
} from './objectUtils';

describe('objectUtils', () => {
  describe('deepClone', () => {
    it('primitíveket változatlanul ad vissza', () => {
      expect(deepClone(null)).toBe(null);
      expect(deepClone(42)).toBe(42);
      expect(deepClone('foo')).toBe('foo');
      expect(deepClone(true)).toBe(true);
    });

    it('tömböt mélyen másol', () => {
      const a = [1, { x: 2 }];
      const b = deepClone(a);
      expect(b).not.toBe(a);
      expect(b).toEqual(a);
      b[1].x = 99;
      expect(a[1].x).toBe(2);
    });

    it('objektumot mélyen másol', () => {
      const a = { foo: { bar: 1 } };
      const b = deepClone(a);
      expect(b).not.toBe(a);
      expect(b).toEqual(a);
      b.foo.bar = 99;
      expect(a.foo.bar).toBe(1);
    });

    it('Date-et másol', () => {
      const d = new Date('2025-01-01');
      const c = deepClone(d);
      expect(c).toBeInstanceOf(Date);
      expect(c.getTime()).toBe(d.getTime());
      expect(c).not.toBe(d);
    });
  });

  describe('deepMerge', () => {
    it('egyesít két objektumot', () => {
      const a = { x: 1, y: { a: 2 } };
      const b = { y: { b: 3 }, z: 4 };
      expect(deepMerge({}, a, b)).toEqual({ x: 1, y: { a: 2, b: 3 }, z: 4 });
    });

    it('üres forrásoknál a cél marad', () => {
      const t = { a: 1 };
      expect(deepMerge(t)).toEqual({ a: 1 });
    });
  });

  describe('pick', () => {
    it('kiválasztja a megadott kulcsokat', () => {
      expect(pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])).toEqual({ a: 1, c: 3 });
    });

    it('nem létez kulcsot kihagy', () => {
      expect(pick({ a: 1 }, ['a', 'x'])).toEqual({ a: 1 });
    });

    it('érvénytelen bemenetnél üres objektum', () => {
      expect(pick(null, ['a'])).toEqual({});
      expect(pick({ a: 1 }, null)).toEqual({});
    });
  });

  describe('omit', () => {
    it('kihagyja a megadott kulcsokat', () => {
      expect(omit({ a: 1, b: 2, c: 3 }, ['b'])).toEqual({ a: 1, c: 3 });
    });

    it('érvénytelen obj-nál üres objektum', () => {
      expect(omit(null, ['a'])).toEqual({});
    });
  });

  describe('renameKeys', () => {
    it('átnevezi a kulcsokat', () => {
      expect(renameKeys({ a: 1, b: 2 }, { a: 'x', b: 'y' })).toEqual({ x: 1, y: 2 });
    });

    it('nem leképezett kulcs marad', () => {
      expect(renameKeys({ a: 1, b: 2 }, { a: 'x' })).toEqual({ x: 1, b: 2 });
    });
  });

  describe('isEmpty', () => {
    it('üres objektumra true', () => {
      expect(isEmpty({})).toBe(true);
    });

    it('nem üres objektumra false', () => {
      expect(isEmpty({ a: 1 })).toBe(false);
    });

    it('null/undefined-ra true', () => {
      expect(isEmpty(null)).toBe(true);
    });
  });

  describe('isEqual', () => {
    it('azonos objektumokra true', () => {
      const o = { a: 1, b: { c: 2 } };
      expect(isEqual(o, o)).toBe(true);
      expect(isEqual({ a: 1 }, { a: 1 })).toBe(true);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 1 } })).toBe(true);
    });

    it('különböz objektumokra false', () => {
      expect(isEqual({ a: 1 }, { a: 2 })).toBe(false);
      expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
      expect(isEqual({ a: { b: 1 } }, { a: { b: 2 } })).toBe(false);
    });

    it('null/undefined kezelés', () => {
      expect(isEqual(null, null)).toBe(true);
      expect(isEqual(null, {})).toBe(false);
    });
  });

  describe('filterObject', () => {
    it('szr predikátum alapján', () => {
      const o = { a: 1, b: 2, c: 3 };
      expect(filterObject(o, (k, v) => v > 1)).toEqual({ b: 2, c: 3 });
      expect(filterObject(o, (k) => k !== 'b')).toEqual({ a: 1, c: 3 });
    });
  });

  describe('mapValues', () => {
    it('értékeket map-el', () => {
      expect(mapValues({ a: 1, b: 2 }, (v) => v * 2)).toEqual({ a: 2, b: 4 });
      expect(mapValues({ a: 1, b: 2 }, (v, k) => `${k}:${v}`)).toEqual({ a: 'a:1', b: 'b:2' });
    });
  });

  describe('mapKeys', () => {
    it('kulcsokat map-el', () => {
      expect(mapKeys({ a: 1, b: 2 }, (k) => k.toUpperCase())).toEqual({ A: 1, B: 2 });
    });
  });

  describe('toPairs / fromPairs', () => {
    it('toPairs objektumot párokra bont', () => {
      expect(toPairs({ a: 1, b: 2 })).toEqual([['a', 1], ['b', 2]]);
    });

    it('fromPairs párokból objektumot képez', () => {
      expect(fromPairs([['a', 1], ['b', 2]])).toEqual({ a: 1, b: 2 });
    });

    it('fromPairs round-trip toPairs-sal', () => {
      const o = { x: 1, y: 2 };
      expect(fromPairs(toPairs(o))).toEqual(o);
    });
  });

  describe('invert', () => {
    it('kulcs és érték felcserélése', () => {
      expect(invert({ a: '1', b: '2' })).toEqual({ '1': 'a', '2': 'b' });
    });

    it('object érték mezt kihagy', () => {
      expect(invert({ a: 1, b: { x: 1 } })).toEqual({ '1': 'a' });
    });
  });

  describe('getDepth', () => {
    it('sík objektum 0', () => {
      expect(getDepth({})).toBe(0);
      expect(getDepth({ a: 1 })).toBe(0);
    });

    it('beágyazott objektum mélysége', () => {
      expect(getDepth({ a: { b: 1 } })).toBe(1);
      expect(getDepth({ a: { b: { c: 1 } } })).toBe(2);
    });
  });

  describe('get', () => {
    it('ponttal elválasztott útvonalat olvas', () => {
      const o = { a: { b: { c: 42 } } };
      expect(get(o, 'a.b.c')).toBe(42);
      expect(get(o, 'a.b')).toEqual({ c: 42 });
      expect(get(o, 'a')).toEqual({ b: { c: 42 } });
    });

    it('nem létez útvonalra defaultValue', () => {
      expect(get({ a: 1 }, 'b', 'default')).toBe('default');
      expect(get({ a: {} }, 'a.b.c', null)).toBe(null);
    });

    it('üres vagy érvénytelen path-ra defaultValue', () => {
      expect(get({ a: 1 }, '', 'x')).toBe('x');
      expect(get(null, 'a', 'y')).toBe('y');
    });
  });

  describe('set', () => {
    it('beállít nested útvonalon', () => {
      const o = { a: { b: 1 } };
      expect(set(o, 'a.b', 99)).toEqual({ a: { b: 99 } });
      expect(o.a.b).toBe(1);
    });

    it('új mezt hoz létre', () => {
      expect(set({}, 'x.y.z', 1)).toEqual({ x: { y: { z: 1 } } });
    });
  });

  describe('stringify', () => {
    it('primitíveket stringként ad vissza', () => {
      expect(stringify(null)).toBe('null');
      expect(stringify(42)).toBe('42');
    });

    it('objektumot olvashatóan formáz', () => {
      expect(stringify({ a: 1, b: 2 })).toContain('a: 1');
      expect(stringify({})).toBe('{}');
    });
  });
});
