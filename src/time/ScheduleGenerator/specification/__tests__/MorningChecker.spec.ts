import { TimeManager } from '../../../TimeManager';
import { MorningChecker } from '../rules/MorningChecker';
import { ScheduleItem } from '../../Table';
import { DayNumber } from '../../../TimeInterval/TimeInterval-constants';
import { Time } from '../../../Time';

describe(MorningChecker.name, () => {
  let timeManager: TimeManager;
  let unitUnderTest: MorningChecker;

  beforeEach(() => {
    timeManager = new TimeManager();
    unitUnderTest = new MorningChecker(timeManager);
  });

  const makeItem = (day: DayNumber, start: Time, end: Time): ScheduleItem => ({
    timeInterval: { dayNumber: day, start: start as any, end: end as any },
    clientIdsInvolved: [1],
  });

  it('returns true for sessions starting at or before 08:45', () => {
    const item = makeItem(1, [8, 45], [9, 30]);
    expect(unitUnderTest.isMorningSession(item)).toBe(true);
  });

  it('returns false for sessions starting after 08:45', () => {
    const item = makeItem(1, [8, 46], [9, 30]);
    expect(unitUnderTest.isMorningSession(item)).toBe(false);
  });

  it('returns true for early morning sessions', () => {
    const item = makeItem(1, [7, 0], [8, 0]);
    expect(unitUnderTest.isMorningSession(item)).toBe(true);
  });
});
