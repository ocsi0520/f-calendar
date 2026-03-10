import { Client } from '../../../../client/Client';
import { DayNumber } from '../../../../definition/time-components';
import { makeSameDayInterval, SameDayInterval } from '../../../../definition/TimeInterval';
import { SameDayIntervalManager } from '../../../../managers/SameDayIntervalManager';
import { TimeManager } from '../../../../managers/TimeManager';
import { TimeMapper } from '../../../../mappers/TimeMapper';
import { CellIntervalsGenerator } from '../CellIntervalsGenerator';
import { CellIntervalsNarrower } from '../CellIntervalsNarrower';

describe(CellIntervalsNarrower.name, () => {
  let unitUnderTest: CellIntervalsNarrower;
  let allPossibleIntervals: Array<SameDayInterval>;
  beforeEach(() => {
    const timeMapper = new TimeMapper();
    const timeManager = new TimeManager(timeMapper);
    const sameDayIntervalManager = new SameDayIntervalManager(timeManager, timeMapper);
    allPossibleIntervals = new CellIntervalsGenerator(
      sameDayIntervalManager,
    ).generateAllPossibleScheduleCells();
    unitUnderTest = new CellIntervalsNarrower(sameDayIntervalManager);
  });

  const makeClient = (intervals: Array<SameDayInterval>): Client => {
    const id = Math.floor(Math.random() * 1_000_000);
    return {
      comment: '',
      disabled: false,
      id,
      name: id.toString(),
      sessionCountsInWeek: Math.ceil(Math.random() * 7) as DayNumber,
      schedule: intervals,
    };
  };

  const clientA = makeClient([
    makeSameDayInterval(1, [10, 45], [13, 0]), // 10.45-12.00
    makeSameDayInterval(1, [14, 0], [16, 0]), // not possible
    makeSameDayInterval(4, [15, 0], [17, 0]), // multiple
    makeSameDayInterval(5, [12, 0], [14, 0]), // not possible
    makeSameDayInterval(5, [19, 0], [20, 30]),
  ]);

  const clientB = makeClient([
    makeSameDayInterval(1, [17, 0], [21, 0]), // not possible
    makeSameDayInterval(2, [8, 0], [21, 0]), // not possible
    makeSameDayInterval(3, [8, 0], [10, 0]), // multiple
    makeSameDayInterval(5, [19, 30], [21, 0]),
  ]);

  const clientsInvolved: Array<Client> = [clientA, clientB];

  const myTime: Array<SameDayInterval> = [
    makeSameDayInterval(1, [7, 30], [12, 0]),
    makeSameDayInterval(1, [15, 0], [18, 0]),
    makeSameDayInterval(3, [8, 0], [11, 0]),
    makeSameDayInterval(4, [13, 0], [18, 0]),
    makeSameDayInterval(5, [9, 0], [12, 0]),
    makeSameDayInterval(5, [14, 0], [16, 0]),
    makeSameDayInterval(5, [19, 0], [21, 0]),
    makeSameDayInterval(6, [8, 0], [21, 0]),
  ];

  it('should handle empty my time', () => {
    const actual = unitUnderTest.getSuitableSameDayIntervals(
      allPossibleIntervals,
      clientsInvolved,
      [],
    );
    expect(actual).empty;
  });

  it('should handle empty client list', () => {
    const actual = unitUnderTest.getSuitableSameDayIntervals(allPossibleIntervals, [], myTime);
    expect(actual).empty;
  });

  it('should handle normal case', () => {
    const expectedIntervals: Array<SameDayInterval> = [
      makeSameDayInterval(1, [10, 45], [12, 0]),
      // makeSameDayInterval(3, [8, 0], [10, 0]) - clientB
      makeSameDayInterval(3, [8, 0], [9, 15]),
      makeSameDayInterval(3, [8, 15], [9, 30]),
      makeSameDayInterval(3, [8, 30], [9, 45]),
      makeSameDayInterval(3, [8, 45], [10, 0]),
      // makeSameDayInterval(4, [15, 0], [17, 0]) - clientA
      makeSameDayInterval(4, [15, 0], [16, 15]),
      makeSameDayInterval(4, [15, 15], [16, 30]),
      makeSameDayInterval(4, [15, 30], [16, 45]),
      makeSameDayInterval(4, [15, 45], [17, 0]),
      // makeSameDayInterval(5, [19, 0], [21, 0]) - clientA & clientB
      makeSameDayInterval(5, [19, 0], [20, 15]),
      makeSameDayInterval(5, [19, 15], [20, 30]),
      makeSameDayInterval(5, [19, 30], [20, 45]),
      makeSameDayInterval(5, [19, 45], [21, 0]),
    ];
    const actual = unitUnderTest.getSuitableSameDayIntervals(
      allPossibleIntervals,
      clientsInvolved,
      myTime,
    );
    expect(actual).toEqual(expectedIntervals);
  });
});
