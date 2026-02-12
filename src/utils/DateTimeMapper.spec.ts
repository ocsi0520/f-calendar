import { TestBed } from '@angular/core/testing';
import { DateTimeMapper } from './DateTimeMapper';
import { methodName } from './test-name';

describe(DateTimeMapper.name, () => {
  let unitUnderTest: DateTimeMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    unitUnderTest = TestBed.inject(DateTimeMapper);
  });

  describe(methodName(DateTimeMapper, 'timeToDate'), () => {
    it('should handle general time', () => {
      const actual = unitUnderTest.timeToDate([10, 15], new Date('2010-11-10'));
      const expected = new Date('2010-11-10T10:15:00');
      expect(actual).toEqual(expected);
    });
    it('should handle midnight', () => {
      const actual = unitUnderTest.timeToDate([0, 0], new Date('2010-11-10'));
      const expected = new Date('2010-11-10T00:00:00');
      expect(actual).toEqual(expected);
    });
    it('should handle almost next day', () => {
      const actual = unitUnderTest.timeToDate([23, 59], new Date('2010-11-10'));
      const expected = new Date('2010-11-10T23:59:00');
      expect(actual).toEqual(expected);
    });
  });
  describe(methodName(DateTimeMapper, 'dateToTime'), () => {
    it('should handle midnight', () => {
        const actual = unitUnderTest.dateToTime(new Date('2010-11-10T00:00:00'));
        expect(actual).toEqual([0, 0]);
    });
    it('should handle general time', () => {
        const actual = unitUnderTest.dateToTime(new Date('2010-11-10T09:47:59'));
        expect(actual).toEqual([9, 47]);
    });
    it('should handle almost next day', () => {
        const actual = unitUnderTest.dateToTime(new Date('2010-11-10T23:59:59'));
        expect(actual).toEqual([23, 59]);
    });
  })
});
