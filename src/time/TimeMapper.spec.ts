import { TestBed } from '@angular/core/testing';
import { TimeMapper } from './TimeMapper';

describe(TimeMapper.name, () => {
  let unitUnderTest: TimeMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TimeMapper] });
    unitUnderTest = TestBed.inject(TimeMapper);
  });

  it('timeToNumber converts times to minutes since midnight', () => {
    expect(unitUnderTest.timeToNumber([0, 0])).toBe(0);
    expect(unitUnderTest.timeToNumber([1, 0])).toBe(60);
    expect(unitUnderTest.timeToNumber([23, 59])).toBe(23 * 60 + 59);
  });

  it('numberToTime converts minutes to Time tuples', () => {
    expect(unitUnderTest.numberToTime(0)).toEqual([0, 0]);
    expect(unitUnderTest.numberToTime(60)).toEqual([1, 0]);
    expect(unitUnderTest.numberToTime(23 * 60 + 59)).toEqual([23, 59]);
  });

  it('numberToTime throws for out-of-range numbers', () => {
    expect(() => unitUnderTest.numberToTime(-1)).toThrowError('invalid time representation');
    expect(() => unitUnderTest.numberToTime(24 * 60)).toThrowError('invalid time representation');
  });
});
