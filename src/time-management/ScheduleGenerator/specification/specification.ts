import { WeekTime } from '../../definition/WeekTime';
import { Table } from '../Table';

export type NextValidStartResult = null | WeekTime;

export type SpecCheckPassedResult = -1;
export type SpecCheckFailResult = number; // positive number
export type SpecCheckResult = SpecCheckPassedResult | SpecCheckFailResult;

export const hasCheckPassed = (result: SpecCheckResult): result is SpecCheckPassedResult =>
  result === -1;

export interface ScheduleSpecification {
  /**
   *
   * @param table whole table
   * @param currentCellLinearIndex index of the changed cell in linear view
   */
  check(table: Table, currentCellLinearIndex: number): NextValidStartResult;
}
