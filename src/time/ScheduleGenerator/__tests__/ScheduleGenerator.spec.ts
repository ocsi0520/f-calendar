import { TestBed } from '@angular/core/testing';
import { methodName } from '../../../utils/test-name';
import { ScheduleGenerator } from '../ScheduleGenerator';
import { broaderInputTable, smallerInputTable } from './input-table';
import { expectedBroaderSchedule, expectedSmallerSchedule } from './output-schedule';

describe(ScheduleGenerator.name, () => {
  let unitUnderTest: ScheduleGenerator;
  beforeAll(() => {
    localStorage.setItem(
      'calendar_clients',
      `[{"name":"Pankotai Lili","sessionCountsInWeek":2,"comment":"","schedule":["4T08:30_-_12:00","5T07:00_-_21:00"],"disabled":false,"id":10},{"name":"Vadai Ágnes","sessionCountsInWeek":2,"comment":"3 lenne","schedule":["1T16:00_-_21:00","2T16:00_-_21:00","4T08:30_-_14:00"],"disabled":false,"id":11},{"name":"Szabó Ágoston","sessionCountsInWeek":3,"comment":"","schedule":["1T12:15_-_15:45","2T12:15_-_15:45","3T12:15_-_15:45","4T10:30_-_12:15"],"disabled":false,"id":12},{"name":"Kovács Anikó","sessionCountsInWeek":2,"comment":"de 2 lenne","schedule":["2T15:00_-_21:00","3T18:30_-_21:00","4T18:00_-_21:00"],"disabled":false,"id":13},{"name":"Balogh Béla","sessionCountsInWeek":1,"comment":"","schedule":["2T07:30_-_08:45","4T07:30_-_08:45","1T07:30_-_08:45","2T17:00_-_21:00","4T17:00_-_21:00"],"disabled":false,"id":15},{"name":"Szabóné Kovács Aranka","sessionCountsInWeek":2,"comment":"","schedule":["1T16:00_-_17:15","2T16:00_-_17:15","5T16:00_-_17:15"],"disabled":true,"id":16},{"name":"Balogh Attiláné","sessionCountsInWeek":2,"comment":"de 2 lenne","schedule":["1T17:15_-_20:15","2T17:15_-_20:15","4T17:15_-_20:15","5T17:15_-_20:15"],"disabled":false,"id":17},{"name":"Suszter Jolán","sessionCountsInWeek":2,"comment":"","schedule":["2T13:00_-_17:00","5T11:00_-_14:30"],"disabled":false,"id":18},{"name":"Varga Enikő","sessionCountsInWeek":2,"comment":"most disabled","schedule":[],"disabled":true,"id":20},{"name":"Liptai Klaudia","sessionCountsInWeek":1,"comment":"","schedule":["1T17:15_-_21:00","2T17:15_-_21:00","4T17:15_-_21:00"],"disabled":false,"id":21},{"name":"Gombos Edina","sessionCountsInWeek":1,"comment":"","schedule":["2T09:00_-_21:00"],"disabled":false,"id":22},{"name":"Joó Eszter","sessionCountsInWeek":1,"comment":"","schedule":[],"disabled":true,"id":23},{"name":"Horváth Zsuzsanna","sessionCountsInWeek":2,"comment":"","schedule":["1T09:00_-_16:00","2T09:00_-_14:00","3T09:00_-_16:00","4T09:00_-_14:00","5T09:00_-_14:00"],"disabled":false,"id":25}]`,
    );
    localStorage.setItem('calendar_clients_id', '25');
    localStorage.setItem('client_pairs', `["10-11","10-12","11-12"]`);
    localStorage.setItem(
      'my_time',
      `["1T10:45_-_18:30","2T07:30_-_17:30","2T19:00_-_20:15","3T16:30_-_20:15","4T10:00_-_18:30","5T10:45_-_18:15"]`,
    );
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    unitUnderTest = TestBed.inject(ScheduleGenerator);
  });
  describe(methodName(ScheduleGenerator, 'generateScheduleFrom'), () => {
    it('should return the same output for the same input', () => {
      const actual = unitUnderTest.generateScheduleFrom(smallerInputTable);
      expect(JSON.stringify(actual)).toBe(JSON.stringify(expectedSmallerSchedule));

      const actual2 = unitUnderTest.generateScheduleFrom(broaderInputTable);
      expect(JSON.stringify(actual2)).toBe(JSON.stringify(expectedBroaderSchedule));
    });
  });
});
