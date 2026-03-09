import { Client } from '../../../../client/Client';
import { ClientInfoValidator } from '../ClientInfoValidator';

describe(ClientInfoValidator.name, () => {
  let unitUnderTest: ClientInfoValidator;
  beforeEach(() => {
    unitUnderTest = new ClientInfoValidator();
  });

  const baseClient: Omit<Client, 'name'> = {
    comment: '',
    disabled: false,
    id: 2,
    schedule: [],
    sessionCountsInWeek: 3,
  };

  it('should pass with proper clientInfo', () => {
    expect(() =>
      unitUnderTest.validate({
        currentIndexOfPossibleCells: 0,
        joinedAt: [],
        possibleCellIndexes: [],
        uniqueDays: 3,
        client: { ...baseClient, name: 'valid client' },
      }),
    ).not.toThrow();
  });
  it('should throw error for improper clientInfo', () => {
    expect(() =>
      unitUnderTest.validate({
        currentIndexOfPossibleCells: 0,
        joinedAt: [],
        possibleCellIndexes: [],
        uniqueDays: 2,
        client: { ...baseClient, name: 'invalid client' },
      }),
    ).toThrowError(/.*invalid client.*/);
  });
});
