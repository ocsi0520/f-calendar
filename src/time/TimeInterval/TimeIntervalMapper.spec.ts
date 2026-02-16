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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TimeIntervalMapper, TimeIntervalPrimitiveMapper, TimeIntervalEventMapper],
    });
    unitUnderTest = TestBed.inject(TimeIntervalMapper);
  });

  it('should delegate mapToString call to primitiveMapper', () => {
    const primitiveMapper = TestBed.inject(TimeIntervalPrimitiveMapper);
    primitiveMapper.mapToString = vi.fn(() => 'SENTINEL');

    const interval = new TimeInterval(2, [8, 0], [9, 30]);
    const result = unitUnderTest.mapToString(interval);

    expect(primitiveMapper.mapToString).toHaveBeenCalledWith(interval);
    expect(result).toBe('SENTINEL');
  });

  it('should delegate mapFromString call to primitiveMapper', () => {
    const primitiveMapper = TestBed.inject(TimeIntervalPrimitiveMapper);

    const returnInterval = new TimeInterval(3, [9, 15], [10, 45]);
    primitiveMapper.mapFromString = vi.fn(() => returnInterval);

    const repr = 'irrelevant';
    const result = unitUnderTest.mapFromString(repr);

    expect(primitiveMapper.mapFromString).toHaveBeenCalledWith(repr);
    expect(result).toBe(returnInterval);
  });

  it('should delegate mapToEvent call to eventMapper', () => {
    const eventMapper = TestBed.inject(TimeIntervalEventMapper);

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
    const eventMapper = TestBed.inject(TimeIntervalEventMapper);

    const returnInterval = new TimeInterval(4, [11, 0], [12, 0]);
    eventMapper.mapFromEvent = vi.fn(() => returnInterval);

    const descriptor: EventDescriptor = { start: new Date(), end: new Date() };
    const result = unitUnderTest.mapFromEvent(descriptor);

    expect(eventMapper.mapFromEvent).toHaveBeenCalledWith(descriptor);
    expect(result).toBe(returnInterval);
  });
});
