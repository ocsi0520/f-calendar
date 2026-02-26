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
    primitiveMapper = new TimeIntervalPrimitiveMapper();
    eventMapper = new TimeIntervalEventMapper(primitiveMapper);
    unitUnderTest = new TimeIntervalMapper(primitiveMapper, eventMapper);
  });

  it('should delegate mapToString call to primitiveMapper', () => {
    primitiveMapper.mapToString = vi.fn(() => 'SENTINEL');

    const interval: TimeInterval = { dayNumber: 2, start: [8, 0], end: [9, 30] };
    const result = unitUnderTest.mapToString(interval);

    expect(primitiveMapper.mapToString).toHaveBeenCalledWith(interval);
    expect(result).toBe('SENTINEL');
  });

  it('should delegate mapFromString call to primitiveMapper', () => {
    const returnInterval: TimeInterval = { dayNumber: 3, start: [9, 15], end: [10, 45] };
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

    const interval: TimeInterval = { dayNumber: 1, start: [7, 0], end: [8, 0] };
    const base = new Date(2024, 0, 1);
    const title = 'MyTitle';

    const result = unitUnderTest.mapToEvent(interval, base, title);

    expect(eventMapper.mapToEvent).toHaveBeenCalledWith(interval, base, title);
    expect(result).toBe(sentinel);
  });

  it('should delegate mapFromEvent call to eventMapper', () => {
    const returnInterval: TimeInterval = { dayNumber: 4, start: [11, 0], end: [12, 0] };
    eventMapper.mapFromEvent = vi.fn(() => returnInterval);

    const descriptor: EventDescriptor = { start: new Date(), end: new Date() };
    const result = unitUnderTest.mapFromEvent(descriptor);

    expect(eventMapper.mapFromEvent).toHaveBeenCalledWith(descriptor);
    expect(result).toBe(returnInterval);
  });

  it('should delegate mapToNumber call to primitiveMapper', () => {
    primitiveMapper.mapToNumber = vi.fn(() => 12345);

    const interval: TimeInterval = { dayNumber: 5, start: [14, 30], end: [15, 45] };
    const result = unitUnderTest.mapToNumber(interval);

    expect(primitiveMapper.mapToNumber).toHaveBeenCalledWith(interval);
    expect(result).toBe(12345);
  });

  it('should delegate mapFromNumber call to primitiveMapper', () => {
    const returnInterval: TimeInterval = { dayNumber: 6, start: [10, 0], end: [11, 30] };
    primitiveMapper.mapFromNumber = vi.fn(() => returnInterval);

    const num = 54321;
    const result = unitUnderTest.mapFromNumber(num);

    expect(primitiveMapper.mapFromNumber).toHaveBeenCalledWith(num);
    expect(result).toBe(returnInterval);
  });
});
