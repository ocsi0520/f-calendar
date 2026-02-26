import { TimeIntervalDeduplicator } from '../TimeIntervalDeduplicator';
import { TimeIntervalPrimitiveMapper } from '../../../TimeInterval/TimeIntervalPrimitiveMapper';
import { TimeInterval } from '../../../TimeInterval/TimeInterval';

describe(TimeIntervalDeduplicator.name, () => {
  let unitUnderTest: TimeIntervalDeduplicator;

  beforeEach(() => {
    unitUnderTest = new TimeIntervalDeduplicator(new TimeIntervalPrimitiveMapper());
  });

  it('should handle 0 items', () => {
    const result = unitUnderTest.deDuplicate([]);
    expect(result).toEqual([]);
  });

  it('should handle only unique items', () => {
    const a: TimeInterval = { dayNumber: 1, start: [8, 0], end: [9, 15] };
    const b: TimeInterval = { dayNumber: 2, start: [8, 0], end: [9, 15] };

    const result = unitUnderTest.deDuplicate([a, b]);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(a);
    expect(result[1]).toEqual(b);
  });

  it('should handle only duplications', () => {
    const a: TimeInterval = { dayNumber: 3, start: [14, 15], end: [15, 30] };

    const result = unitUnderTest.deDuplicate([a, a, a]);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(a);
  });

  it('should handle a normal case', () => {
    const firstPart: Array<TimeInterval> = [
      { dayNumber: 1, start: [9, 0], end: [10, 15] },
      { dayNumber: 1, start: [9, 15], end: [10, 30] },
      { dayNumber: 1, start: [9, 30], end: [10, 45] },
      { dayNumber: 1, start: [10, 0], end: [11, 15] },
    ];
    const secondPart: Array<TimeInterval> = [
      { dayNumber: 1, start: [9, 30], end: [10, 45] },
      { dayNumber: 1, start: [10, 0], end: [11, 15] },
      { dayNumber: 1, start: [10, 15], end: [11, 30] },
      { dayNumber: 1, start: [10, 30], end: [11, 45] },
    ];
    const actual = unitUnderTest.deDuplicate([...firstPart, ...secondPart]);
    expect(actual).toEqual([...firstPart, ...secondPart.slice(2)]);
  });
});
