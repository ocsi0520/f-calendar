import { TimeManager } from '../../TimeManager';
import { TimeIntervalManager } from '../TimeIntervalManager';
import type { TimeInterval } from '../TimeInterval';

describe('TimeIntervalManager.isIntervalAtOrAfterSecond', () => {
  let unitUnderTest: TimeIntervalManager;
  beforeEach(() => {
    unitUnderTest = new TimeIntervalManager(new TimeManager());
  });

  it('identical intervals (equal starts and ends) => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [9, 15], end: [10, 30] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 15], end: [10, 30] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('same object reference => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [9, 15], end: [10, 30] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, examined)).toBe(true);
  });

  it('interval earlier day => false', () => {
    const examined: TimeInterval = { dayNumber: 1, start: [9, 0], end: [10, 0] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 0], end: [10, 0] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
  });

  it('interval later day => true', () => {
    const examined: TimeInterval = { dayNumber: 3, start: [9, 0], end: [10, 0] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 0], end: [10, 0] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('same day, starts equal, interval ends earlier => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [9, 15], end: [9, 45] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 15], end: [10, 0] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('same day, starts equal, interval ends later => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [9, 15], end: [11, 0] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 15], end: [10, 0] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('same day, interval starts after second start (strictly greater) => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [10, 0], end: [11, 0] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 30], end: [10, 30] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('same day, interval starts before second start (strictly less) => false', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [8, 0], end: [9, 30] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 0], end: [9, 15] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
  });

  it('same day, interval starts before but overlaps second => false', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [9, 0], end: [11, 0] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 30], end: [10, 0] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
  });

  it('same day, interval starts after second and non-overlapping later => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [11, 0], end: [11, 30] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 0], end: [9, 30] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('boundary minute precision one minute before => false', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [9, 14], end: [9, 45] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 15], end: [10, 0] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
  });

  it('boundary minute precision one minute after => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [9, 16], end: [9, 45] };
    const base: TimeInterval = { dayNumber: 2, start: [9, 15], end: [10, 0] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('midnight boundary equal starts => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [0, 0], end: [1, 0] };
    const base: TimeInterval = { dayNumber: 2, start: [0, 0], end: [0, 30] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });

  it('different-day adjacency previous day vs next day => false', () => {
    const examined: TimeInterval = { dayNumber: 6, start: [23, 59], end: [23, 59] };
    const base: TimeInterval = { dayNumber: 7, start: [0, 0], end: [0, 1] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(false);
  });

  it('large gap same day start comparison only => true', () => {
    const examined: TimeInterval = { dayNumber: 2, start: [23, 0], end: [23, 30] };
    const base: TimeInterval = { dayNumber: 2, start: [0, 0], end: [0, 30] };
    expect(unitUnderTest.isIntervalAtOrAfterBase(examined, base)).toBe(true);
  });
});
