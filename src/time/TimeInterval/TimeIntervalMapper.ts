import { inject, Injectable } from '@angular/core';
import { TimeInterval } from './TimeInterval';
import { EventInput } from '@fullcalendar/core/index.js';
import { TimeIntervalPrimitiveMapper } from './TimeIntervalPrimitiveMapper';
import { TimeIntervalEventMapper } from './TimeIntervalEventMapper';
import { EventDescriptor } from './TimeInterval-constants';

@Injectable({
  providedIn: 'root',
})
export class TimeIntervalMapper {
  private primitiveMapper = inject(TimeIntervalPrimitiveMapper);
  private eventMapper = inject(TimeIntervalEventMapper);

  public mapToString(timeInterval: TimeInterval): string {
    return this.primitiveMapper.mapToString(timeInterval);
  }

  public mapFromString(representation: string): TimeInterval {
    return this.primitiveMapper.mapFromString(representation);
  }

  public mapFromEvent(representation: EventDescriptor): TimeInterval {
    return this.eventMapper.mapFromEvent(representation);
  }

  public mapToEvent(timeInterval: TimeInterval, baseDate: Date, title?: string): EventInput {
    return this.eventMapper.mapToEvent(timeInterval, baseDate, title);
  }
}
