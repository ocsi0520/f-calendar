import { TestBed } from '@angular/core/testing';
import { methodName } from '../../../utils/test-name';
import { WeekSchedule } from '../../Schedule';
import { TimeInterval } from '../../TimeInterval/TimeInterval';
import { allMorningClient, impossibleClient } from './TestClients';
import { WeekScheduleGeneratorService } from '../WeekScheduleGenerator.service';
import { DayNumber } from '../../TimeInterval/TimeInterval-constants';
import { TimeIntervalPrimitiveMapper } from '../../TimeInterval/TimeIntervalPrimitiveMapper';

describe(WeekScheduleGeneratorService.name, () => {
  let unitUnderTest: WeekScheduleGeneratorService;
  let primitiveMapper: TimeIntervalPrimitiveMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WeekScheduleGeneratorService, TimeIntervalPrimitiveMapper],
    });
    unitUnderTest = TestBed.inject(WeekScheduleGeneratorService);
    primitiveMapper = TestBed.inject(TimeIntervalPrimitiveMapper);
  });

  const getSchedulesOnDays = (): Record<DayNumber, Array<TimeInterval>> => ({
    1: [
      // monday both before/afternoon
      primitiveMapper.mapFromString('1T08:30_-_12:00'),
      primitiveMapper.mapFromString('1T13:30_-_18:00'),
    ],
    2: [
      // tuesday only beforenoon/in the morning

      primitiveMapper.mapFromString('2T07:15_-_13:45'),
    ],
    3: [
      // wednesday only afternoon
      primitiveMapper.mapFromString('3T14:00_-_17:00'),
    ],
    4: [], // no thursday,
    5: [
      // friday around noon
      primitiveMapper.mapFromString('5T10:00_-_14:00'),
    ],
    6: [
      // saturday whole day
      primitiveMapper.mapFromString('6T07:00_-_21:00'),
    ],
    7: [
      // sunday only in the morning
      primitiveMapper.mapFromString('7T07:00_-_10:30'),
    ],
  });

  const combineScheduleDaySchedules = (...dayNumbers: Array<DayNumber>): WeekSchedule => {
    dayNumbers.sort(); // one digit -> string sort is fine
    const schedulesOnDays = getSchedulesOnDays();
    return dayNumbers
      .map((dayNumber) => schedulesOnDays[dayNumber])
      .reduce((acc, curr) => [...acc, ...curr], []);
  };
  const getWholeWeekSchedule = () =>
    combineScheduleDaySchedules(
      ...Object.keys(getSchedulesOnDays()).map((i) => Number(i) as DayNumber),
    );

  describe(methodName(WeekScheduleGeneratorService, 'getClientsWithNoOverlappingTime'), () => {
    it('should return empty array if no clients are present', () => {
      expect(unitUnderTest.getClientsWithNoOverlappingTime([], [])).toEqual([]);
      expect(unitUnderTest.getClientsWithNoOverlappingTime(getWholeWeekSchedule(), [])).toEqual([]);
    });
    it('should return an empty array if all clients have proper overlapping', () => {
      expect(
        unitUnderTest.getClientsWithNoOverlappingTime(getWholeWeekSchedule(), [allMorningClient]),
      ).toEqual([]);
    });
    it('should return a client which is impossible to have session with', () => {
      expect(
        unitUnderTest.getClientsWithNoOverlappingTime(getWholeWeekSchedule(), [impossibleClient]),
      ).toEqual([impossibleClient]);
    });
  });
});
