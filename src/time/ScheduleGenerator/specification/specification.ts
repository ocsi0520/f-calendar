import { Table } from '../Table';

// TODO: there should be 3 types of specification:
// - item-specification (cell/session)
// - day-specification
// - week-specification
// i.e. ProperPairs, NoSameDayForSameClient, NoOverlappingSessions could be a day-specification
// i.e. WithinAvailabiltyForClient and WithinAvailabiltyForMe could be item-specification

// OR just simply add the 'changedCell'
export interface ScheduleSpecification {
  check(table: Table): boolean;
}
