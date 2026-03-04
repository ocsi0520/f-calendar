import {
  Component,
  computed,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  WritableSignal,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import {
  CalendarOptions,
  EventChangeArg,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core/index.js';
import { baseCalendarOptions } from './base-calendar-options';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CalendarEventMapper } from '../CalendarEventMapper';
import { Session, sessionTime } from '../../session';
import { CalendarEventDescriptor } from '../event-descriptor';

@Component({
  selector: 'app-calendar',
  imports: [FullCalendarModule],
  templateUrl: './app-calendar.html',
  styleUrl: './app-calendar.scss',
})
export class AppCalendar implements OnChanges {
  mapper = inject(CalendarEventMapper);

  public events: WritableSignal<EventInput[]> = signal([]);

  public weekSchedule = input.required<Array<Session>>();
  public weekScheduleChange = output<Array<Session>>();

  public title = input.required<string>();
  public isReadOnly = input<boolean>(false);

  private snackBar = inject(MatSnackBar);

  public ngOnChanges(changes: SimpleChanges<typeof this>): void {
    const changeOfSchedule = changes['weekSchedule'];
    if (!changeOfSchedule) return;
    this.events.set(
      changeOfSchedule.currentValue.map((timeInterval) =>
        this.mapper.mapToEvent(timeInterval, new Date()),
      ),
    );
  }

  public calendarOptions = computed<CalendarOptions>(() => ({
    ...baseCalendarOptions,
    selectable: !this.isReadOnly(),
    eventClick: this.removeEvent.bind(this),
    select: this.addEvent.bind(this),
    eventChange: this.changeEvent.bind(this),
  }));

  private removeEvent(eventClickArg: Pick<EventClickArg, 'event'>) {
    const intervalToRemove = this.mapper.mapFromEvent(eventClickArg.event);
    const newSchedule = this.weekSchedule().filter(
      (interval) => !isSameInterval(interval, intervalToRemove),
    );
    this.weekScheduleChange.emit(newSchedule);
  }
  private addEvent(dateSelectArg: CalendarEventDescriptor) {
    if (!this.atLeastSessionTime(dateSelectArg)) {
      this.snackBar.open("Time slots can't be less than 75 minutes ❌", undefined, {
        duration: 2_000,
      });
      return;
    }
    const newTimeInterval = this.mapper.mapFromEvent({
      start: dateSelectArg.start!,
      end: dateSelectArg.end!,
      title: this.title(),
    });
    const newSchedule = [...this.weekSchedule(), newTimeInterval];
    this.weekScheduleChange.emit(newSchedule);
  }
  private changeEvent(eventChangeArg: EventChangeArg): void {
    if (!this.atLeastSessionTime(eventChangeArg.event)) {
      eventChangeArg.revert();
      this.snackBar.open("Time slots can't be less than 75 minutes ❌", undefined, {
        duration: 2_000,
      });
      return;
    }

    const intervalToRemove = this.mapper.mapFromEvent(eventChangeArg.oldEvent);
    const newTimeInterval = this.mapper.mapFromEvent({
      start: eventChangeArg.event.start,
      end: eventChangeArg.event.end,
      title: intervalToRemove.displayName,
    });
    const newSchedule = this.weekSchedule().map((interval) =>
      isSameInterval(interval, intervalToRemove) ? newTimeInterval : interval,
    );

    this.weekScheduleChange.emit(newSchedule);
  }
  private atLeastSessionTime(eventDesc: CalendarEventDescriptor): boolean {
    const timeSpanInMilliSeconds = eventDesc.end!.valueOf() - eventDesc.start!.valueOf();
    return timeSpanInMilliSeconds >= sessionTime.inMilliSeconds;
  }
}
