import { WeekTime } from '../../definition/WeekTime';
import { Table } from '../Table';

export type NextTryHint = { firstValidStart: WeekTime };
export type FailResult = { passed: false; nextTryHint: NextTryHint; name: string };
export type Result = { passed: true } | FailResult;

export interface ScheduleSpecification {
  /**
   *
   * @param table whole table
   * @param currentCellLinearIndex index of the changed cell in linear view
   */
  check(table: Table, currentCellLinearIndex: number): Result;
}
