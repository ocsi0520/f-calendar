import { SessionCellGenerator } from '../SessionCellGenerator';
import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { methodName } from '../../../utils/test-name';

describe(SessionCellGenerator.name, () => {
  describe(methodName(SessionCellGenerator, 'generateAllPossibleCellsWith'), () => {
    const unitUnderTest = new SessionCellGenerator();
    it('should generate non, as interval is less than a session span', () => {
      const shortInterval = new TimeInterval(1, [9, 0], [10, 0]); // 60 minutes < 75
      const actual = unitUnderTest.generateAllPossibleCellsWith(shortInterval);
      expect(actual).toHaveLength(0);
    });

    it('should generate one, as interval matches session span', () => {
      const exact = new TimeInterval(1, [9, 0], [10, 15]); // 75 minutes
      const actual = unitUnderTest.generateAllPossibleCellsWith(exact);

      expect(actual).toHaveLength(1);
      expect(actual[0].timeInterval.isSameInterval(exact)).true;
    });

    it('should generate two, as interval is longer w/ 15 mins than session span', () => {
      const slot = new TimeInterval(1, [9, 0], [10, 30]); // 90 minutes -> two starts (0 and +15)

      const actual = unitUnderTest.generateAllPossibleCellsWith(slot);
      const expected = [
        new TimeInterval(1, [9, 0], [10, 15]),
        new TimeInterval(1, [9, 15], [10, 30]),
      ];
      for (let i = 0; i < expected.length; i++)
        expect(actual[i].timeInterval.isSameInterval(expected[i])).true;
    });

    it('should generate 6', () => {
      // length = 75 + 5*15 = 150 minutes -> 6 possible session starts
      const slot = new TimeInterval(1, [9, 0], [11, 30]);

      const actual = unitUnderTest.generateAllPossibleCellsWith(slot);
      const expected = [
        new TimeInterval(1, [9, 0], [10, 15]),
        new TimeInterval(1, [9, 15], [10, 30]),
        new TimeInterval(1, [9, 30], [10, 45]),
        new TimeInterval(1, [9, 45], [11, 0]),
        new TimeInterval(1, [10, 0], [11, 15]),
        new TimeInterval(1, [10, 15], [11, 30]),
      ];
      for (let i = 0; i < expected.length; i++)
        expect(actual[i].timeInterval.isSameInterval(expected[i])).true;
    });
  });
});
