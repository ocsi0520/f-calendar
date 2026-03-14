import { WeekTime } from '../../definition/WeekTime';
import { Table } from '../Table';

export type NextValidStartResult = null | WeekTime;

export interface ScheduleSpecification {
  /**
   *
   * @param table whole table
   * @param currentCellLinearIndex index of the changed cell in linear view
   */
  check(table: Table, currentCellLinearIndex: number): NextValidStartResult;
}
