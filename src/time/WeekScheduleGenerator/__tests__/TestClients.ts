import { Client } from '../../../client/Client';
import { NumberRange } from '../../../utils/Range';
import { TimeIntervalPrimitiveMapper } from '../../TimeInterval/TimeIntervalPrimitiveMapper';

let idCounter = 0;

const primitiveMapper = new TimeIntervalPrimitiveMapper();
const createClient = (
  name: string,
  sessionCountsInWeek: NumberRange<7>,
  scheduleStrings: Array<string>,
): Client => ({
  id: idCounter++,
  name,
  comment: name,
  sessionCountsInWeek,
  schedule: scheduleStrings.map((s) => primitiveMapper.mapFromString(s)),
});

export const allMorningClient: Client = createClient('all morning', 2, [
  '1T07:30_-_10:00',
  '2T07:30_-_10:00',
  '3T07:30_-_10:00',
  '4T07:30_-_10:00',
  '5T07:30_-_10:00',
  '6T07:30_-_10:00',
  '7T07:30_-_10:00',
]);

export const impossibleClient: Client = createClient('impossible', 1, [
  '1T05:30_-_07:00',
  '2T05:30_-_07:30',
  '3T05:30_-_07:45',
  '4T05:30_-_07:00',
  '5T05:30_-_07:15',
  '6T05:30_-_07:30',
  '7T05:30_-_07:45',
]);
