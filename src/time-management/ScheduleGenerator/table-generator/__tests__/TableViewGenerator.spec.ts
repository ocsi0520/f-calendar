import { makeSameDayInterval, SameDayInterval } from '../../../definition/TimeInterval';
import { makeTableCell } from '../../__tests__/makeEmptyTableCell';
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

  const allSuitableCells: Array<TableCell> = allSuitableIntervals.map((timeInterval) =>
    makeTableCell(
      timeInterval.dayNumber,
      [timeInterval.start.hour, timeInterval.start.minute],
      [timeInterval.end.hour, timeInterval.end.minute],
    ),
  );
  it('should group cells by day properly', () => {
    const actual = unitUnderTest.generateViewsFrom(allSuitableCells);
    expect(actual.linear).toEqual(allSuitableCells);

    expect(actual.byDay).toEqual([7, 9, 10, 10, 14, 14]);
  });
  it('should handle empty case', () => {
    const actual = unitUnderTest.generateViewsFrom([]);
    expect(actual.linear).empty;
    expect(actual.byDay).toEqual([-1, -1, -1, -1, -1, -1]);
  });
  it('should handle case when only Wednesday is present', () => {
    const allCells = [makeTableCell(3, [10, 15], [11, 30])];
    const actual = unitUnderTest.generateViewsFrom(allCells);
    expect(actual.linear).toEqual(allCells);
    expect(actual.byDay).toEqual([-1, -1, 0, 0, 0, 0]);
  });

  it('should handle case when only Monday is present', () => {
    const allCells = [
      makeTableCell(1, [8, 0], [9, 15], [1]),
      makeTableCell(1, [9, 15], [10, 30], [2]),
      makeTableCell(1, [11, 0], [12, 15], [3]),
    ];

    const actual = unitUnderTest.generateViewsFrom(allCells);
    expect(actual.linear).toEqual(allCells);
    expect(actual.byDay).toEqual([2, 2, 2, 2, 2, 2]);
  });

  it('should handle case when only Sunday is present', () => {
    const allCells = [
      makeTableCell(7, [8, 0], [9, 15], [1]),
      makeTableCell(7, [9, 15], [10, 30], [2]),
      makeTableCell(7, [11, 0], [12, 15], [3]),
    ];

    const actual = unitUnderTest.generateViewsFrom(allCells);
    expect(actual.linear).toEqual(allCells);
    expect(actual.byDay).toEqual([-1, -1, -1, -1, -1, -1]);
  });
});
