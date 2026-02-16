import { TestBed } from '@angular/core/testing';
import { TimeIntervalMapper } from './TimeIntervalMapper';
import { TimeIntervalPrimitiveMapper } from './TimeIntervalPrimitiveMapper';
import { TimeIntervalEventMapper } from './TimeIntervalEventMapper';
import { TimeInterval } from './TimeInterval';
import { vi } from 'vitest';
import { EventInput } from '@fullcalendar/core/index.js';
import { EventDescriptor } from './TimeInterval-constants';

describe(TimeIntervalMapper.name, () => {
  let unitUnderTest: TimeIntervalMapper;
  let primitiveMapper: TimeIntervalPrimitiveMapper;
  let eventMapper: TimeIntervalEventMapper;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeIntervalMapper, TimeIntervalPrimitiveMapper, TimeIntervalEventMapper],
    });
    primitiveMapper = TestBed.inject(TimeIntervalPrimitiveMapper);
    eventMapper = TestBed.inject(TimeIntervalEventMapper);

    unitUnderTest = TestBed.inject(TimeIntervalMapper);
  });

  it('should delegate mapToString call to primitiveMapper', () => {
    primitiveMapper.mapToString = vi.fn(() => 'SENTINEL');

    const interval = new TimeInterval(2, [8, 0], [9, 30]);
    const result = unitUnderTest.mapToString(interval);

    expect(primitiveMapper.mapToString).toHaveBeenCalledWith(interval);
    expect(result).toBe('SENTINEL');
  });

  it('should delegate mapFromString call to primitiveMapper', () => {
    const returnInterval = new TimeInterval(3, [9, 15], [10, 45]);
    primitiveMapper.mapFromString = vi.fn(() => returnInterval);

    const repr = 'irrelevant';
    const result = unitUnderTest.mapFromString(repr);

    expect(primitiveMapper.mapFromString).toHaveBeenCalledWith(repr);
    expect(result).toBe(returnInterval);
  });

  it('should delegate mapToEvent call to eventMapper', () => {
    const sentinel: EventInput = {
      id: 'x',
      start: new Date(2000, 1, 12, 11, 0),
      end: new Date(2000, 1, 12, 13, 0),
    };
    eventMapper.mapToEvent = vi.fn(() => sentinel);

    const interval = new TimeInterval(1, [7, 0], [8, 0]);
    const base = new Date(2024, 0, 1);
    const title = 'MyTitle';

    const result = unitUnderTest.mapToEvent(interval, base, title);

    expect(eventMapper.mapToEvent).toHaveBeenCalledWith(interval, base, title);
    expect(result).toBe(sentinel);
  });

  it('should delegate mapFromEvent call to eventMapper', () => {
    const returnInterval = new TimeInterval(4, [11, 0], [12, 0]);
    eventMapper.mapFromEvent = vi.fn(() => returnInterval);

    const descriptor: EventDescriptor = { start: new Date(), end: new Date() };
    const result = unitUnderTest.mapFromEvent(descriptor);

    expect(eventMapper.mapFromEvent).toHaveBeenCalledWith(descriptor);
    expect(result).toBe(returnInterval);
  });

  it('should delegate mapToNumber call to primitiveMapper', () => {
    primitiveMapper.mapToNumber = vi.fn(() => 12345);

    const interval = new TimeInterval(5, [14, 30], [15, 45]);
    const result = unitUnderTest.mapToNumber(interval);

    expect(primitiveMapper.mapToNumber).toHaveBeenCalledWith(interval);
    expect(result).toBe(12345);
  });

  it('should delegate mapFromNumber call to primitiveMapper', () => {
    const returnInterval = new TimeInterval(6, [10, 0], [11, 30]);
    primitiveMapper.mapFromNumber = vi.fn(() => returnInterval);

    const num = 54321;
    const result = unitUnderTest.mapFromNumber(num);

    expect(primitiveMapper.mapFromNumber).toHaveBeenCalledWith(num);
    expect(result).toBe(returnInterval);
  });
});
