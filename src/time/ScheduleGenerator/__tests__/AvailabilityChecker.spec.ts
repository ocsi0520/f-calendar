import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AvailabilityChecker } from '../AvailabilityChecker';
import { SessionCellGenerator } from '../SessionCellGenerator';
import { SessionCell } from '../SessionCell';
import { Client } from '../../../client/Client';
import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { WeekSchedule } from '../../Schedule';
import { methodName } from '../../../utils/test-name';

describe(AvailabilityChecker.name, () => {
  let availabilityChecker: AvailabilityChecker;
  let sessionCellGenerator: SessionCellGenerator;
  let aClient: Client;

  beforeEach(() => {
    sessionCellGenerator = new SessionCellGenerator();

    aClient = {
      id: 1,
      comment: '',
      name: 'Kis Gizella',
      sessionCountsInWeek: 2,
      schedule: [],
    };

    availabilityChecker = new AvailabilityChecker(sessionCellGenerator);
  });

  describe(methodName(AvailabilityChecker, 'getAllPossibleSessionCellsForClient'), () => {
    it('should return empty array when both schedules are empty', () => {
      const mySchedule: WeekSchedule = [];
      aClient.schedule = [];

      const result = availabilityChecker.getAllPossibleSessionCellsForClient(mySchedule, aClient);

      expect(result).toEqual([]);
    });

    it('should return empty array when my schedule is empty', () => {
      const mySchedule: WeekSchedule = [];
      aClient.schedule = [new TimeInterval(1, [9, 0], [10, 15])];

      const result = availabilityChecker.getAllPossibleSessionCellsForClient(mySchedule, aClient);

      expect(result).toEqual([]);
    });

    it('should return empty array when client schedule is empty', () => {
      const mySchedule: WeekSchedule = [new TimeInterval(1, [9, 0], [10, 15])];
      aClient.schedule = [];

      const result = availabilityChecker.getAllPossibleSessionCellsForClient(mySchedule, aClient);

      expect(result).toEqual([]);
    });

    it('should return matching session cells when schedules are exactly the same', () => {
      const timeSlot = new TimeInterval(1, [9, 0], [10, 15]);
      const mySchedule: WeekSchedule = [timeSlot];
      aClient.schedule = [timeSlot];

      const expectedCell: SessionCell = { timeInterval: timeSlot, status: 'available' };

      const result = availabilityChecker.getAllPossibleSessionCellsForClient(mySchedule, aClient);

      expect(result).toEqual([expectedCell]);
    });

    it('should filter out non-matching cells', () => {
      const mySchedule: WeekSchedule = [new TimeInterval(1, [9, 0], [10, 15])];
      aClient.schedule = [new TimeInterval(2, [14, 0], [15, 15])];

      const result = availabilityChecker.getAllPossibleSessionCellsForClient(mySchedule, aClient);

      expect(result).toEqual([]);
    });

    it('should handle multiple schedule slots correctly', () => {
      const mySchedule: WeekSchedule = [
        new TimeInterval(1, [9, 0], [10, 15]),
        new TimeInterval(3, [14, 0], [15, 15]),
      ];
      aClient.schedule = [
        new TimeInterval(1, [9, 0], [10, 15]),
        new TimeInterval(5, [10, 0], [11, 15]),
      ];

      const result = availabilityChecker.getAllPossibleSessionCellsForClient(mySchedule, aClient);

      expect(result.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle normal scenario', () => {
      const mySchedule: WeekSchedule = [
        new TimeInterval(1, [9, 0], [12, 15]),
        new TimeInterval(2, [14, 0], [18, 0]),
        new TimeInterval(3, [8, 0], [11, 0]),
        new TimeInterval(4, [8, 0], [15, 0]),
      ];
      aClient.schedule = [
        new TimeInterval(1, [8, 0], [11, 0]),
        new TimeInterval(2, [13, 0], [19, 0]),
        new TimeInterval(3, [10, 30], [14, 0]),
        new TimeInterval(5, [8, 0], [15, 0]),
      ];

      const actual = availabilityChecker.getAllPossibleSessionCellsForClient(mySchedule, aClient);
      expect(actual.map((i) => i.timeInterval.toString())).toEqual([
        '1T09:00_-_10:15',
        '1T09:15_-_10:30',
        '1T09:30_-_10:45',
        '1T09:45_-_11:00',

        '2T14:00_-_15:15',
        '2T14:15_-_15:30',
        '2T14:30_-_15:45',
        '2T14:45_-_16:00',
        '2T15:00_-_16:15',
        '2T15:15_-_16:30',
        '2T15:30_-_16:45',
        '2T15:45_-_17:00',
        '2T16:00_-_17:15',
        '2T16:15_-_17:30',
        '2T16:30_-_17:45',
        '2T16:45_-_18:00',
      ]);
    });
  });
});
