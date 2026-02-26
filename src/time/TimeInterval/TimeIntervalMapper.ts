import { Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
import { EventInput } from '@fullcalendar/core/index.js';
import { TimeIntervalPrimitiveMapper } from './TimeIntervalPrimitiveMapper';
import { TimeIntervalEventMapper } from './TimeIntervalEventMapper';
import { EventDescriptor } from './TimeInterval-constants';

@Injectable({
  providedIn: 'root',
})
export class TimeIntervalMapper {
  constructor(
    private primitiveMapper: TimeIntervalPrimitiveMapper,
    private eventMapper: TimeIntervalEventMapper,
  ) {}

  public mapToString(timeInterval: TimeInterval): string {
    return this.primitiveMapper.mapToString(timeInterval);
  }

  public mapFromString(representation: string): TimeInterval {
    return this.primitiveMapper.mapFromString(representation);
  }

  public mapToNumber(timeInterval: TimeInterval): number {
    return this.primitiveMapper.mapToNumber(timeInterval);
  }

  public mapFromNumber(representation: number): TimeInterval {
    return this.primitiveMapper.mapFromNumber(representation);
  }

  public mapFromEvent(representation: EventDescriptor): TimeInterval {
    return this.eventMapper.mapFromEvent(representation);
  }

  public mapToEvent(timeInterval: TimeInterval, baseDate: Date, title?: string): EventInput {
    return this.eventMapper.mapToEvent(timeInterval, baseDate, title);
  }
}
