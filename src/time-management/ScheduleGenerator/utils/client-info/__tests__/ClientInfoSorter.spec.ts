import { DayNumber } from '../../../../definition/time-components';
import { ClientInfo } from '../../../Table';
import { ClientInfoSorter } from '../ClientInfoSorter';

describe(ClientInfoSorter.name, () => {
  let unitUnderTest: ClientInfoSorter;
  beforeEach(() => {
    unitUnderTest = new ClientInfoSorter();
  });
  const makeClientInfo = (
    countOfPossiblePlaces: number,
    uniqueDays: DayNumber,
    name: string,
  ): ClientInfo => ({
    client: {
      name,
      id: Math.floor(Math.random() * 1_000_000),
      comment: '',
      disabled: false,
      schedule: [],
      sessionCountsInWeek: uniqueDays,
    },
    currentIndexOfPossibleCells: 0,
    joinedAt: [],
    uniqueDays: uniqueDays,
    possibleCellIndexes: Array.from({ length: countOfPossiblePlaces }).map((_, i) => i),
  });

  it('should sort clients properly', () => {
    const clientInfos: Array<ClientInfo> = [
      makeClientInfo(10, 3, 'Ivett'),
      makeClientInfo(5, 1, 'Janka'),
      makeClientInfo(3, 3, 'Dóra'),
      makeClientInfo(2, 1, 'Noémi'),
      makeClientInfo(2, 2, 'Blanka'),
      makeClientInfo(4, 2, 'Ágnes'),
    ];
    unitUnderTest.sortByRelativeChanceOfSuccess(clientInfos);
    const expectedOrderForNames: Array<string> = [
      'Blanka',
      'Dóra',
      'Noémi',
      'Ágnes',
      'Ivett',
      'Janka',
    ];
    expect(clientInfos.map((info) => info.client.name)).toEqual(expectedOrderForNames);
  });
});
