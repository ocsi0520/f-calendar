import { TestBed } from '@angular/core/testing';
import { TimeIntervalFactory } from '../../time/TimeInterval/TimeIntervalFactory';
import { TimeIntervalMapper } from '../../time/TimeInterval/TimeIntervalMapper';
import { MyTimeService } from '../my-time.service';
import { TimeInterval } from '../../time/TimeInterval/TimeInterval';
describe(MyTimeService.name, () => {
  let unitUnderTest: MyTimeService;

  const interval1 = new TimeInterval(1, [9, 15], [13, 0]);
  const interval2 = new TimeInterval(1, [17, 0], [20, 15]);
  const interval3 = new TimeInterval(3, [11, 0], [15, 0]);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeIntervalMapper, TimeIntervalFactory],
    });
    unitUnderTest = TestBed.inject(MyTimeService);
    localStorage.clear();
  });
  it('should return empty', () => {
    expect(unitUnderTest.loadSchedule()).empty;
  });
  it('should return 1 saved', () => {
    unitUnderTest.saveSchedule([interval1]);
    expect(unitUnderTest.loadSchedule()).toEqual([interval1]);
  });
  it('should return 2 saved in order', () => {
    unitUnderTest.saveSchedule([interval2, interval1]);
    expect(unitUnderTest.loadSchedule()).toEqual([interval1, interval2]);
  });
  it('should delete all', () => {
    unitUnderTest.saveSchedule([interval2, interval1]);
    unitUnderTest.saveSchedule([]);
    expect(unitUnderTest.loadSchedule()).toEqual([]);
  });
  it('should override', () => {
    unitUnderTest.saveSchedule([interval2, interval1]);
    unitUnderTest.saveSchedule([interval3, interval1]);
    expect(unitUnderTest.loadSchedule()).toEqual([interval1, interval3]);
  });

  it('should sort properly', () => {
    unitUnderTest.saveSchedule([interval3, interval1, interval2]);
    expect(unitUnderTest.loadSchedule()).toEqual([interval1, interval2, interval3]);
  });
});
