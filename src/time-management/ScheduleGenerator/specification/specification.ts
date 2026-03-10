import { WeekTime } from '../../definition/WeekTime';
import { Table } from '../Table';

// TODO: remove NextValidStartResult
export type NextValidStartResult = WeekTime;
export type Result = null | NextValidStartResult;

export interface ScheduleSpecification {
  /**
   *
   * @param table whole table
   * @param currentCellLinearIndex index of the changed cell in linear view
   */
  check(table: Table, currentCellLinearIndex: number): Result;
}
