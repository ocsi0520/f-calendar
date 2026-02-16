import { TestBed } from '@angular/core/testing';
import { SessionCellGenerator } from '../SessionCellGenerator';
import { isSameInterval, TimeInterval } from '../../TimeInterval/TimeInterval';
import { methodName } from '../../../utils/test-name';
import { TimeIntervalPrimitiveMapper } from '../../TimeInterval/TimeIntervalPrimitiveMapper';

describe(SessionCellGenerator.name, () => {
  let unitUnderTest: SessionCellGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionCellGenerator, TimeIntervalPrimitiveMapper],
    });
    unitUnderTest = TestBed.inject(SessionCellGenerator);
  });

  describe(methodName(SessionCellGenerator, 'generateAllPossibleCellsWith'), () => {
    it('should generate non, as interval is less than a session span', () => {
      const shortInterval: TimeInterval = { dayNumber: 1, start: [9, 0], end: [10, 0] }; // 60 minutes < 75
      const actual = unitUnderTest.generateAllPossibleCellsWith(shortInterval);
      expect(actual).toHaveLength(0);
    });

    it('should generate one, as interval matches session span', () => {
      const exact: TimeInterval = { dayNumber: 1, start: [9, 0], end: [10, 15] }; // 75 minutes
      const actual = unitUnderTest.generateAllPossibleCellsWith(exact);

      expect(actual).toHaveLength(1);
      expect(isSameInterval(actual[0].timeInterval, exact)).true;
    });

    it('should generate two, as interval is longer w/ 15 mins than session span', () => {
      const slot: TimeInterval = { dayNumber: 1, start: [9, 0], end: [10, 30] }; // 90 minutes -> two starts (0 and +15)

      const actual = unitUnderTest.generateAllPossibleCellsWith(slot);
      const expected: TimeInterval[] = [
        { dayNumber: 1, start: [9, 0], end: [10, 15] },
        { dayNumber: 1, start: [9, 15], end: [10, 30] },
      ];
      for (let i = 0; i < expected.length; i++)
        expect(isSameInterval(actual[i].timeInterval, expected[i])).true;
    });

    it('should generate 6', () => {
      // length = 75 + 5*15 = 150 minutes -> 6 possible session starts
      const slot: TimeInterval = { dayNumber: 1, start: [9, 0], end: [11, 30] };

      const actual = unitUnderTest.generateAllPossibleCellsWith(slot);
      const expected: TimeInterval[] = [
        { dayNumber: 1, start: [9, 0], end: [10, 15] },
        { dayNumber: 1, start: [9, 15], end: [10, 30] },
        { dayNumber: 1, start: [9, 30], end: [10, 45] },
        { dayNumber: 1, start: [9, 45], end: [11, 0] },
        { dayNumber: 1, start: [10, 0], end: [11, 15] },
        { dayNumber: 1, start: [10, 15], end: [11, 30] },
      ];
      for (let i = 0; i < expected.length; i++)
        expect(isSameInterval(actual[i].timeInterval, expected[i])).true;
    });
  });
});
