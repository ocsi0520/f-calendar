import { makeSameDayInterval } from '../../../definition/TimeInterval';
import { TableCell } from '../../Table';
import { MorningChecker } from '../rules/MorningChecker';

describe(MorningChecker.name, () => {
  let unitUnderTest: MorningChecker;

  beforeEach(() => {
    unitUnderTest = new MorningChecker();
  });

  const makeCell = (
    ...makeSameDayIntervalParams: Parameters<typeof makeSameDayInterval>
  ): TableCell => ({
    timeInterval: makeSameDayInterval(...makeSameDayIntervalParams),
    clientIdsInvolved: [1],
  });

  it('returns true for sessions starting before 08:45', () => {
    const cell = makeCell(1, [8, 30], [9, 45]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });

  it('returns true for sessions starting at or before 08:45', () => {
    const cell = makeCell(1, [8, 45], [10, 0]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });

  it('returns false for sessions starting after 08:45', () => {
    const cell = makeCell(1, [9, 0], [10, 15]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(false);
  });

  it('returns true for early morning sessions', () => {
    const cell = makeCell(1, [7, 0], [8, 15]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });
});
