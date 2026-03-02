import { Result, ScheduleSpecification } from './specification';
import { ScheduleCell, Table } from '../Table';
import { TimeIntervalManager } from '../../TimeInterval/TimeIntervalManager';

export class SpecificationManager {
  /**
   *
   * @param timeIntervalManager simple interval manager
   * @param allSpecifications specifications to be followed. !! ORDER DOES MATTER !!
   *  Spec checks (in case of violation) return the first possible interval as a hint.
   *  The hint coming from the first failed spec check is returned in `checkSpecifications` method
   */
  constructor(
    private readonly timeIntervalManager: TimeIntervalManager,
    private readonly allSpecifications: Array<ScheduleSpecification>,
  ) {}

  public checkSpecifications(table: Table): Result {
    // from table, we can get the current cell, day and whole week later
    const currentCell = this.getCurrentCell(table);
    const cellsOnSameDay = this.getCellsWithSameDay(table, currentCell);

    for (let spec of this.allSpecifications) {
      const result = this.getResult(spec.check(table, cellsOnSameDay, currentCell), currentCell);
      if (!result.passed) return result;
    }

    return { passed: true };
  }

  private getCurrentCell(table: Table): ScheduleCell {
    return table.scheduleCells[table.currentScheduleCellIndex];
  }

  // TODO: this could be cached in a simple array i.e. at construction or for the first time
  private getCellsWithSameDay(table: Table, currentCell: ScheduleCell): Array<ScheduleCell> {
    return table.scheduleCells.filter(
      (cell) => cell.timeInterval.dayNumber === currentCell.timeInterval.dayNumber,
    );
  }

  // TODO: later on delete this one
  private getResult(
    result: Result | boolean,
    { timeInterval: currentInterval }: ScheduleCell,
  ): Result {
    if (typeof result !== 'boolean') return result;

    if (result) return { passed: true };

    return {
      passed: false,
      nextTryHint: {
        firstValidInterval: this.timeIntervalManager.shiftByGranularity(currentInterval),
      },
      name: 'some available stuff'
    };
  }
}
