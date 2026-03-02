import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { ScheduleCell, Table } from '../Table';

// TODO: there should be 3 types of specification:
// - cell-specification (cell/session)
// - day-specification
// - week-specification
// i.e. ProperPairs, NoSameDayForSameClient, NoOverlappingSessions could be a day-specification
// i.e. WithinAvailabiltyForClient and WithinAvailabiltyForMe could be cell-specification

// OR just simply add the 'changedCell'

export type NextTryHint = {
  firstValidInterval: TimeInterval;
};
export type FailResult = { passed: false; nextTryHint: NextTryHint; name: string };
export type Result = { passed: true } | FailResult;

export interface ScheduleSpecification {
  /**
   *
   * @param table the whole table
   * @param cellsOnSameDay cells on the same day as `currentCell`, including `currentCell`
   * @param currentCell the currently modified cell
   */
  check(
    table: Table,
    cellsOnSameDay: Array<ScheduleCell>,
    currentCell: ScheduleCell,
  ): Result | boolean;
}
