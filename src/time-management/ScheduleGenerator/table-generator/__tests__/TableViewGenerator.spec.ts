import { makeSameDayInterval, SameDayInterval } from '../../../definition/TimeInterval';
import { TableCell } from '../../Table';
import { TableViewGenerator } from '../TableViewGenerator';

describe(TableViewGenerator.name, () => {
  let unitUnderTest: TableViewGenerator;
  beforeEach(() => {
    unitUnderTest = new TableViewGenerator();
  });

  const allSuitableIntervals: Array<SameDayInterval> = [
    makeSameDayInterval(1, [8, 0], [9, 15]),
    makeSameDayInterval(1, [8, 15], [9, 30]),
    makeSameDayInterval(1, [8, 30], [9, 45]),
    makeSameDayInterval(1, [8, 45], [10, 0]),
    makeSameDayInterval(1, [9, 0], [10, 15]),
    makeSameDayInterval(1, [9, 15], [10, 30]),
    makeSameDayInterval(1, [9, 30], [10, 45]),
    makeSameDayInterval(1, [9, 45], [11, 0]),

    makeSameDayInterval(2, [8, 0], [9, 15]),
    makeSameDayInterval(2, [8, 15], [9, 30]),

    makeSameDayInterval(3, [16, 0], [17, 15]),

    makeSameDayInterval(5, [13, 0], [14, 15]),
    makeSameDayInterval(5, [13, 15], [14, 30]),
    makeSameDayInterval(5, [19, 0], [20, 15]),
    makeSameDayInterval(5, [19, 15], [20, 30]),

    makeSameDayInterval(7, [12, 0], [13, 15]),
  ];

  const allSuitableCells: Array<TableCell> = allSuitableIntervals.map((timeInterval) => ({
    timeInterval,
    clientIdsInvolved: [],
  }));
  it('should group cells by day properly', () => {
    const actual = unitUnderTest.generateViewsFrom(allSuitableCells);
    expect(actual.linear).toEqual(allSuitableCells);

    expect(actual.byDay).toEqual([
      [],
      allSuitableCells.slice(0, 8),
      allSuitableCells.slice(8, 10),
      [allSuitableCells[10]],
      [],
      allSuitableCells.slice(11, 15),
      [],
      [allSuitableCells[15]],
    ]);
  });
});
