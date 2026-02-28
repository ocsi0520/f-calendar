import { TimeManager } from '../../../TimeManager';
import { MorningChecker } from '../rules/MorningChecker';
import { ScheduleCell } from '../../Table';
import { DayNumber } from '../../../TimeInterval/TimeInterval-constants';
import { Time } from '../../../Time';

describe(MorningChecker.name, () => {
  let timeManager: TimeManager;
  let unitUnderTest: MorningChecker;

  beforeEach(() => {
    timeManager = new TimeManager();
    unitUnderTest = new MorningChecker(timeManager);
  });

  const makeCell = (day: DayNumber, start: Time, end: Time): ScheduleCell => ({
    timeInterval: { dayNumber: day, start: start as any, end: end as any },
    clientIdsInvolved: [1],
  });

  it('returns true for sessions starting at or before 08:45', () => {
    const cell = makeCell(1, [8, 45], [9, 30]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });

  it('returns false for sessions starting after 08:45', () => {
    const cell = makeCell(1, [8, 46], [9, 30]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(false);
  });

  it('returns true for early morning sessions', () => {
    const cell = makeCell(1, [7, 0], [8, 0]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });
});
