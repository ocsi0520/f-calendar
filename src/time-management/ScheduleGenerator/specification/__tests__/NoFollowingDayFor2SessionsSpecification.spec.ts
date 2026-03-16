import { methodName } from '../../../../utils/test-name';
import { makeTableCell } from '../../__tests__/makeEmptyTableCell';
import { ClientInfo, Table, TableCell } from '../../Table';
import { makeTable } from './SpecificationTestHelper';
import { NoFollowingDayFor2SessionsSpecification } from '../rules/NoFollowingDayFor2SessionsSpecification';
import { TableUtils } from '../../TableManager/TableUtils';
import { DayNumber } from '../../../definition/time-components';
import { NumberRange } from '../../../../utils/Range';
import { NextValidStartResult } from '../specification';
import { makeWeekTime } from '../../../definition/WeekTime';

describe(methodName(NoFollowingDayFor2SessionsSpecification, 'check'), () => {
  let unitUnderTest: NoFollowingDayFor2SessionsSpecification;
  const clientId = 1;
  const otherClientId = 2;

  beforeEach(() => {
    unitUnderTest = new NoFollowingDayFor2SessionsSpecification(new TableUtils());
  });

  const createCellsForDay = (dayNumber: DayNumber): Array<TableCell> => [
    makeTableCell(dayNumber, [9, 45], [11, 0], []),
    makeTableCell(dayNumber, [10, 0], [11, 15], []),
    makeTableCell(dayNumber, [10, 15], [11, 30], []),
    makeTableCell(dayNumber, [10, 30], [11, 45], []),
    makeTableCell(dayNumber, [10, 45], [12, 0], []),
    makeTableCell(dayNumber, [11, 0], [12, 15], []),
    makeTableCell(dayNumber, [11, 15], [12, 30], []),
    makeTableCell(dayNumber, [11, 30], [12, 45], []),
    makeTableCell(dayNumber, [11, 45], [13, 0], []),
    makeTableCell(dayNumber, [12, 0], [13, 15], []),
    makeTableCell(dayNumber, [12, 15], [13, 30], []),
    makeTableCell(dayNumber, [12, 30], [13, 45], []),
    makeTableCell(dayNumber, [12, 45], [14, 0], []),
    makeTableCell(dayNumber, [13, 0], [14, 15], []),
  ];

  const getActualindex = (dayToSkip: number, indexInDay: NumberRange<13>) =>
    dayToSkip * 14 + indexInDay;

  const insertClientIdAt = (
    table: Table,
    dayToSkip: number,
    indexInDay: NumberRange<13>,
    id: typeof clientId | typeof otherClientId,
  ): void => {
    table.cellPart.views.linear[getActualindex(dayToSkip, indexInDay)].clientIdsInvolved.push(id);
  };

  const getCellResult = (
    table: Table,
    dayToSkip: number,
    indexInDay: NumberRange<13>,
  ): NextValidStartResult => {
    return unitUnderTest.check(table, getActualindex(dayToSkip, indexInDay));
  };

  const makeClientInfo = (clientId: number, sessionCountsInWeek: number): ClientInfo => ({
    client: {
      id: clientId,
      comment: '',
      disabled: false,
      name: 'client',
      schedule: [],
      sessionCountsInWeek,
    },
    currentIndexOfPossibleCells: 0,
    joinedAt: [],
    possibleCellIndexes: [],
    uniqueDays: sessionCountsInWeek as DayNumber,
  });

  describe('not 2 sessions per week', () => {
    it('returns true in case the user has 1 session per week', () => {
      const table = makeTable(
        [makeTableCell(1, [10, 0], [11, 15], [clientId])],
        [makeClientInfo(clientId, 1)],
      );
      expect(getCellResult(table, 0, 0)).null;
    });
    it('returns true in case the user has 3 sessions per week', () => {
      const table = makeTable(
        [
          makeTableCell(1, [10, 0], [11, 15], [clientId]),
          makeTableCell(2, [10, 0], [11, 15], [clientId]),
          makeTableCell(3, [10, 0], [11, 15], [clientId]),
        ],
        [makeClientInfo(clientId, 3)],
      );
      expect(getCellResult(table, 0, 0)).null;
      expect(getCellResult(table, 0, 1)).null;
      expect(getCellResult(table, 0, 2)).null;
    });
  });

  const makeTableCellWithClients = (cells: Array<TableCell>): Table => {
    return makeTable(cells, [makeClientInfo(clientId, 2), makeClientInfo(otherClientId, 2)]);
  };

  describe('monday', () => {
    it('returns true for sole cell', () => {
      const table = makeTableCellWithClients([makeTableCell(1, [10, 0], [11, 15], [clientId])]);
      expect(getCellResult(table, 0, 0)).null;
    });
    it('returns true for multiple cells', () => {
      const table = makeTableCellWithClients(createCellsForDay(1));
      insertClientIdAt(table, 0, 1, clientId);
      expect(getCellResult(table, 0, 1)).null;
    });
  });

  describe('tuesday', () => {
    it('returns true if it is tuesday but there is no one on monday', () => {
      const table = makeTableCellWithClients(createCellsForDay(2));
      insertClientIdAt(table, 0, 1, clientId);
      expect(getCellResult(table, 0, 1)).null;
    });
    it('returns true if it is tuesday but there are only non-occupied ones on monday', () => {
      const table = makeTableCellWithClients([...createCellsForDay(1), ...createCellsForDay(2)]);
      insertClientIdAt(table, 1, 1, clientId);
      expect(getCellResult(table, 1, 1)).null;
    });
    it('returns false if it is tuesday and there is one on monday from the same client', () => {
      const table = makeTableCellWithClients([...createCellsForDay(1), ...createCellsForDay(2)]);
      insertClientIdAt(table, 0, 1, clientId);
      insertClientIdAt(table, 1, 1, clientId);
      expect(getCellResult(table, 1, 1)).toEqual(makeWeekTime(3, 0, 0));
    });
    it('returns true if it is tuesday but there is one on monday from the another client', () => {
      const table = makeTableCellWithClients([...createCellsForDay(1), ...createCellsForDay(2)]);
      insertClientIdAt(table, 0, 1, otherClientId);
      insertClientIdAt(table, 1, 1, clientId);
      expect(getCellResult(table, 1, 1)).null;
    });
  });

  describe('wednesday', () => {
    it('returns true as only wednesday is present', () => {
      const table = makeTableCellWithClients(createCellsForDay(3));
      insertClientIdAt(table, 0, 5, clientId);
      expect(getCellResult(table, 0, 5)).null;
    });
    it('returns true as all previous days are empty', () => {
      const table = makeTableCellWithClients([
        ...createCellsForDay(1),
        ...createCellsForDay(2),
        ...createCellsForDay(3),
      ]);
      insertClientIdAt(table, 2, 10, clientId);
      expect(getCellResult(table, 2, 10)).null;
    });
    it('returns true as the other session is on monday', () => {
      const table = makeTableCellWithClients([
        ...createCellsForDay(1),
        ...createCellsForDay(2),
        ...createCellsForDay(3),
      ]);
      insertClientIdAt(table, 0, 9, clientId);
      insertClientIdAt(table, 2, 11, clientId);
      expect(getCellResult(table, 2, 11)).null;
    });
    it('returns true as the other session is on monday and tuesday does not have any sessions', () => {
      const table = makeTableCellWithClients([...createCellsForDay(1), ...createCellsForDay(3)]);
      insertClientIdAt(table, 0, 9, clientId);
      insertClientIdAt(table, 1, 11, clientId);
      expect(getCellResult(table, 1, 11)).null;
    });
    it('returns true as tuesday is occupied by another client', () => {
      const table = makeTableCellWithClients([
        ...createCellsForDay(1),
        ...createCellsForDay(2),
        ...createCellsForDay(3),
      ]);
      insertClientIdAt(table, 1, 9, otherClientId);
      insertClientIdAt(table, 2, 11, clientId);
      expect(getCellResult(table, 2, 11)).null;
    });
    it('returns false as the other session is on monday', () => {
      const table = makeTableCellWithClients([
        ...createCellsForDay(1),
        ...createCellsForDay(2),
        ...createCellsForDay(3),
      ]);
      insertClientIdAt(table, 1, 9, clientId);
      insertClientIdAt(table, 2, 11, clientId);
      expect(getCellResult(table, 2, 11)).toEqual(makeWeekTime(4, 0, 0));
    });
  });

  describe('sunday', () => {
    const getTableForSunday = (hasSaturdaySessions: boolean) =>
      makeTableCellWithClients([
        ...createCellsForDay(1),
        ...createCellsForDay(2),
        ...createCellsForDay(3),
        ...createCellsForDay(4),
        ...createCellsForDay(5),
        ...(hasSaturdaySessions ? createCellsForDay(6) : []),
        ...createCellsForDay(7),
      ]);
    it('returns true as only sunday has sessions', () => {
      const table = makeTableCellWithClients(createCellsForDay(7));
      insertClientIdAt(table, 0, 5, clientId);
      expect(getCellResult(table, 0, 5)).null;
    });

    it('returns true if it is sunday and only sunday has an occupied session', () => {
      const table = getTableForSunday(true);
      insertClientIdAt(table, 6, 0, clientId);
      expect(getCellResult(table, 6, 0)).null;
    });

    it('returns true if it is sunday but the previous occupied session is on friday', () => {
      const table = getTableForSunday(true);
      insertClientIdAt(table, 4, 11, clientId);
      insertClientIdAt(table, 6, 3, clientId);
      expect(getCellResult(table, 6, 3)).null;
    });

    it('returns true if it is sunday and saturday does not have any sessions', () => {
      const table = getTableForSunday(false);
      insertClientIdAt(table, 4, 11, clientId);
      insertClientIdAt(table, 5, 2, clientId);
      expect(getCellResult(table, 5, 2)).null;
    });

    it('returns true if it is sunday and saturday is occupied by other client', () => {
      const table = getTableForSunday(true);
      insertClientIdAt(table, 5, 8, otherClientId);
      insertClientIdAt(table, 6, 5, clientId);
      expect(getCellResult(table, 6, 3)).null;
    });

    it('returns false if it is sunday and saturday is occupied by same client', () => {
      const table = getTableForSunday(true);
      insertClientIdAt(table, 5, 8, clientId);
      insertClientIdAt(table, 6, 5, clientId);
      expect(getCellResult(table, 6, 3)).toEqual(makeWeekTime(7, 23, 59));
    });
  });
});
