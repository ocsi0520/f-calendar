import { TestBed } from '@angular/core/testing';
import { methodName } from '../../../utils/test-name';
import { ScheduleGenerator } from '../ScheduleGenerator';
import { outputTable } from './output-table';
import { TableGenerator } from '../table-generator/TableGenerator';
import { testClients, testMyTime, testNextId, testPairs } from './test-input';
import { AllowedSpecificationsDescriptor } from '../specification/allowance/AllowedSpecificationsDescriptor';

describe(ScheduleGenerator.name, () => {
  let tableGenerator: TableGenerator;
  let unitUnderTest: ScheduleGenerator;

  beforeAll(() => {
    const allowedSpecs: AllowedSpecificationsDescriptor = {
      breakfast: true,
      lunch: true,
      noFollowingDayFor2Sessions: false,
    };
    localStorage.setItem('calendar_clients', JSON.stringify(testClients));
    localStorage.setItem('calendar_clients_id', JSON.stringify(testNextId));
    localStorage.setItem('client_pairs', JSON.stringify(testPairs));
    localStorage.setItem('my_time', JSON.stringify(testMyTime));
    localStorage.setItem('allowed_specs', JSON.stringify(allowedSpecs));
  });

  beforeEach(() => {
    TestBed.configureTestingModule({});
    tableGenerator = TestBed.inject(TableGenerator);
    unitUnderTest = TestBed.inject(ScheduleGenerator);
  });
  describe(methodName(ScheduleGenerator, 'createScheduleIn'), () => {
    it('should generate the same schedule inside the table', () => {
      const inputTable = tableGenerator.generateTable();
      unitUnderTest.createScheduleIn(inputTable);
      expect(inputTable).toEqual(outputTable);
    });
  });
});
