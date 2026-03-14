import { makeTableCell } from '../../__tests__/makeEmptyTableCell';
import { MorningChecker } from '../rules/MorningChecker';

describe(MorningChecker.name, () => {
  let unitUnderTest: MorningChecker;

  beforeEach(() => {
    unitUnderTest = new MorningChecker();
  });

  it('returns true for sessions starting before 08:45', () => {
    const cell = makeTableCell(1, [8, 30], [9, 45], [1]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });

  it('returns true for sessions starting at or before 08:45', () => {
    const cell = makeTableCell(1, [8, 45], [10, 0], [1]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });

  it('returns false for sessions starting after 08:45', () => {
    const cell = makeTableCell(1, [9, 0], [10, 15], [1]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(false);
  });

  it('returns true for early morning sessions', () => {
    const cell = makeTableCell(1, [7, 0], [8, 15], [1]);
    expect(unitUnderTest.isMorningSession(cell)).toBe(true);
  });
});
