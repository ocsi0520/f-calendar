import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  ConstraintInput,
  DateSelectArg,
  DateSpanApi,
  EventApi,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core/index.js';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { DateTimeMapper } from '../../utils/DateTimeMapper';

@Component({
  selector: 'app-my-time',
  imports: [FullCalendarModule],
  templateUrl: './app-my-time.html',
  styleUrl: './app-my-time.scss',
})
export class AppMyTime {
  private static BUSINESS_TIME_START = '06:00' as const;
  private static BUSINESS_TIME_END = '22:00' as const;
  private static BUSINESS_CONSTRAINT: ConstraintInput = {
    start: AppMyTime.BUSINESS_TIME_START,
    end: AppMyTime.BUSINESS_TIME_END,
  };
  public events: WritableSignal<EventInput[]> = signal([]);

  private eventIdCounter = this.events().length;

  private mapper = inject(DateTimeMapper);

  public calendarOptions: CalendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    slotDuration: '00:15:00', // 15-minute granularity
    selectable: true, // drag selection
    firstDay: 1,
    editable: true,
    weekends: true,
    allDaySlot: false,
    locale: 'HU',
    dragScroll: true,
    height: 'auto',
    slotMinTime: AppMyTime.BUSINESS_TIME_START,
    slotMaxTime: AppMyTime.BUSINESS_TIME_END,
    nowIndicator: true,
    // remove prev/next and title
    headerToolbar: { left: '', center: '', right: '' },
    selectConstraint: AppMyTime.BUSINESS_CONSTRAINT,
    eventConstraint: AppMyTime.BUSINESS_CONSTRAINT,
    eventClick: this.removeEvent.bind(this),
    select: this.addEvent.bind(this),
  };
  private removeEvent(eventClickArg: EventClickArg) {
    const idOfRemoved = this.getIdOf(eventClickArg.event);
    this.events.set(this.events().filter((event) => event.id !== idOfRemoved));
  }
  private addEvent(dateSelectArg: DateSelectArg) {
    console.log(this.getIdOf(dateSelectArg));
    const newEvent: EventInput = {
      title: 'Meeting',
      start: dateSelectArg.start,
      end: dateSelectArg.end,
      color: 'lightblue',
      id: this.getIdOf(dateSelectArg),
    };
    this.events.set([...this.events(), newEvent]);
    this.eventIdCounter++;
  }
  private getIdOf(eventDescriptor: Pick<EventApi, 'start' | 'end'>): string {
    if (!eventDescriptor.start || !eventDescriptor.end) {
      console.error(eventDescriptor);
      throw new Error('Error with event descriptor');
    }
    const [startString, endString] = [
      this.mapper.dateToTimeString(eventDescriptor.start),
      this.mapper.dateToTimeString(eventDescriptor.end),
    ];
    return `${startString}_-_${endString}`;
  }
}
