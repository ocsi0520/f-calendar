import { Table } from '../Table';

export interface ScheduleSpecification {
  check(table: Table): boolean;
}
