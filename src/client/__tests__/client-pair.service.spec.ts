import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ClientPairService } from '../client-pair.service';
import { methodName } from '../../utils/test-name';

describe(ClientPairService.name, () => {
  let unitUnderTest: ClientPairService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [ClientPairService],
    });
    unitUnderTest = TestBed.inject(ClientPairService);
  });

  it('should be created', () => {
    expect(unitUnderTest).toBeTruthy();
  });

  describe(`${methodName(ClientPairService, 'getAll')}`, () => {
    it('should return empty array when no pairs exist', () => {
      expect(unitUnderTest.getAll()).toEqual([]);
    });

    it('should return all added pairs', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 4);
      unitUnderTest.addPair(5, 6);
      const result = unitUnderTest.getAll();
      expect(result).toHaveLength(3);
    });

    it('should return pairs in normalized order', () => {
      unitUnderTest.addPair(5, 1);
      unitUnderTest.addPair(10, 3);
      const result = unitUnderTest.getAll();
      expect(result).toContainEqual([1, 5]);
      expect(result).toContainEqual([3, 10]);
    });
  });

  describe(`${methodName(ClientPairService, 'exists')}`, () => {
    it('should return false when pair does not exist', () => {
      expect(unitUnderTest.exists(1, 2)).toBe(false);
    });

    it('should return true when pair exists', () => {
      unitUnderTest.addPair(1, 2);
      expect(unitUnderTest.exists(1, 2)).toBe(true);
    });

    it('should return true when pair exists in reversed order', () => {
      unitUnderTest.addPair(1, 2);
      expect(unitUnderTest.exists(2, 1)).toBe(true);
    });

    it('should return false for non-existent pair when other pairs exist', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 4);
      expect(unitUnderTest.exists(1, 3)).toBe(false);
    });
  });

  describe(`${methodName(ClientPairService, 'addPair')}`, () => {
    it('should add a pair', () => {
      unitUnderTest.addPair(1, 2);
      expect(unitUnderTest.exists(1, 2)).toBe(true);
    });

    it('should add multiple pairs', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 4);
      unitUnderTest.addPair(5, 6);
      expect(unitUnderTest.getAll()).toHaveLength(3);
    });

    it('should not add pair if a === b', () => {
      unitUnderTest.addPair(1, 1);
      expect(unitUnderTest.getAll()).toEqual([]);
    });

    it('should not add duplicate pair', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(1, 2);
      expect(unitUnderTest.getAll()).toHaveLength(1);
    });

    it('should not add duplicate pair when added in reversed order', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(2, 1);
      expect(unitUnderTest.getAll()).toHaveLength(1);
    });

    it('should persist pair to localStorage', () => {
      unitUnderTest.addPair(1, 2);
      const stored = localStorage.getItem('client_pairs');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed).toContain('1-2');
    });
  });

  describe(`${methodName(ClientPairService, 'removePair')}`, () => {
    it('should remove an existing pair', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.removePair(1, 2);
      expect(unitUnderTest.exists(1, 2)).toBe(false);
    });

    it('should remove pair in reversed order', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.removePair(2, 1);
      expect(unitUnderTest.exists(1, 2)).toBe(false);
    });

    it('should not affect other pairs when removing one', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 4);
      unitUnderTest.removePair(1, 2);
      expect(unitUnderTest.exists(3, 4)).toBe(true);
    });

    it('should persist removal to localStorage', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.removePair(1, 2);
      const stored = localStorage.getItem('client_pairs');
      const parsed = JSON.parse(stored!);
      expect(parsed).not.toContain('1-2');
    });

    it('should handle removal of non-existent pair gracefully', () => {
      expect(() => unitUnderTest.removePair(1, 2)).not.toThrow();
    });
  });

  describe(`${methodName(ClientPairService, 'removePairsByClientId')}`, () => {
    it('should remove all pairs containing a specific client', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(1, 3);
      unitUnderTest.addPair(1, 4);
      unitUnderTest.removePairsByClientId(1);
      expect(unitUnderTest.getAll()).toEqual([]);
    });

    it('should remove only pairs containing the specified client', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(1, 3);
      unitUnderTest.addPair(4, 5);
      unitUnderTest.removePairsByClientId(1);
      expect(unitUnderTest.getAll()).toEqual([[4, 5]]);
    });

    it('should work when client is first in pair', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 4);
      unitUnderTest.removePairsByClientId(1);
      expect(unitUnderTest.exists(1, 2)).toBe(false);
      expect(unitUnderTest.exists(3, 4)).toBe(true);
    });

    it('should work when client is second in pair', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 4);
      unitUnderTest.removePairsByClientId(2);
      expect(unitUnderTest.exists(1, 2)).toBe(false);
      expect(unitUnderTest.exists(3, 4)).toBe(true);
    });

    it('should handle removal of non-existent client gracefully', () => {
      unitUnderTest.addPair(1, 2);
      expect(() => unitUnderTest.removePairsByClientId(999)).not.toThrow();
      expect(unitUnderTest.getAll()).toHaveLength(1);
    });

    it('should persist changes to localStorage', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(1, 3);
      unitUnderTest.removePairsByClientId(1);
      const stored = localStorage.getItem('client_pairs');
      const parsed = JSON.parse(stored!);
      expect(parsed).toHaveLength(0);
    });
  });

  describe(`${methodName(ClientPairService, 'getPairClientsFor')}`, () => {
    it('should return empty array when client has no pairs', () => {
      const result = unitUnderTest.getPairClientsFor({ id: 1, name: '', sessionCountsInWeek: 1, comment: '', schedule: [] });
      expect(result).toEqual([]);
    });

    it('should return paired clients for given client', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(1, 3);
      unitUnderTest.addPair(1, 4);
      const result = unitUnderTest.getPairClientsFor({ id: 1, name: '', sessionCountsInWeek: 1, comment: '', schedule: [] });
      expect(result).toHaveLength(3);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(4);
    });

    it('should work when client is second in pair', () => {
      unitUnderTest.addPair(2, 1);
      unitUnderTest.addPair(3, 1);
      const result = unitUnderTest.getPairClientsFor({ id: 1, name: '', sessionCountsInWeek: 1, comment: '', schedule: [] });
      expect(result).toHaveLength(2);
      expect(result).toContain(2);
      expect(result).toContain(3);
    });

    it('should return clients regardless of pair order', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 1);
      const result = unitUnderTest.getPairClientsFor({ id: 1, name: '', sessionCountsInWeek: 1, comment: '', schedule: [] });
      expect(result).toEqual([2, 3]);
    });

    it('should handle mixed ordering correctly', () => {
      unitUnderTest.addPair(1, 5);
      unitUnderTest.addPair(3, 1);
      unitUnderTest.addPair(1, 2);
      const result = unitUnderTest.getPairClientsFor({ id: 1, name: '', sessionCountsInWeek: 1, comment: '', schedule: [] });
      expect(result).toHaveLength(3);
      expect(result).toContain(2);
      expect(result).toContain(3);
      expect(result).toContain(5);
    });
  });

  describe('persistence and loading', () => {
    it('should load pairs from localStorage on creation', () => {
      localStorage.setItem('client_pairs', JSON.stringify(['1-2', '3-4']));
      const newService = new ClientPairService();
      expect(newService.getAll()).toHaveLength(2);
      expect(newService.exists(1, 2)).toBe(true);
      expect(newService.exists(3, 4)).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('client_pairs', 'invalid json');
      expect(() => {
        new ClientPairService();
      }).not.toThrow();
    });

    it('should clear pairs if localStorage contains invalid data', () => {
      localStorage.setItem('client_pairs', 'invalid json');
      const newService = new ClientPairService();
      expect(newService.getAll()).toEqual([]);
    });

    it('should persist and restore multiple operations', () => {
      unitUnderTest.addPair(1, 2);
      unitUnderTest.addPair(3, 4);
      unitUnderTest.addPair(5, 6);
      
      const newService = new ClientPairService();
      expect(newService.getAll()).toHaveLength(3);
      expect(newService.exists(1, 2)).toBe(true);
      expect(newService.exists(3, 4)).toBe(true);
      expect(newService.exists(5, 6)).toBe(true);
    });
  });
});
