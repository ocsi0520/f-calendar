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
import { EventDescriptor } from '../time/TimeInterval/TimeInterval-constants';
import { TimeIntervalFactory } from '../time/TimeInterval/TimeIntervalFactory';
import { WeekSchedule } from '../time/Schedule';
import { ClientService } from '../client/client.service';
import { baseCalendarOptions } from './base-calendar-options';
import { MatButtonModule } from '@angular/material/button';
import { sessionSpan } from '../time/session-span';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-scheduler-manager',
  imports: [FullCalendarModule, MatButtonModule],
  templateUrl: './scheduler-manager.html',
  styleUrl: './scheduler-manager.scss',
})
export class SchedulerManager implements OnChanges {
  timeIntervalFactory = inject(TimeIntervalFactory);
  clientService = inject(ClientService);

  public events: WritableSignal<EventInput[]> = signal([]);

  public initialWeekSchedule = input.required<WeekSchedule>();
  public title = input.required<string>();
  public isReadWrite = input<boolean>(true);

  public saveNewSchedule = output<WeekSchedule>();
  private snackBar = inject(MatSnackBar);
  public reset(): void {
    this.events.set(
      this.initialWeekSchedule().map((timeInterval) =>
        timeInterval.toEventWith(new Date(), this.title()),
      ),
    );
  }
  public save(): void {
    this.saveNewSchedule.emit(
      this.events().map((event) => this.timeIntervalFactory.createOf(event as EventDescriptor)),
    );
  }
  // TOOD: later on this can be removed, as only MyTime is generated immediately, the other ones are going to be generated later
  public fixCalendar(): void {
    this.events.set([...this.events()]);
  }

  public ngOnChanges(changes: SimpleChanges<typeof this>): void {
    const changeOfSchedule = changes['initialWeekSchedule'];
    if (!changeOfSchedule) return;
    this.events.set(
      changeOfSchedule.currentValue.map((timeInterval) =>
        timeInterval.toEventWith(new Date(), this.title()),
      ),
    );
  }

  public calendarOptions = computed<CalendarOptions>(() => ({
    ...baseCalendarOptions,
    selectable: this.isReadWrite(),
    eventClick: this.removeEvent.bind(this),
    select: this.addEvent.bind(this),
    eventChange: this.changeEvent.bind(this),
  }));

  private removeEvent(eventClickArg: Pick<EventClickArg, 'event'>) {
    const idOfRemoved = this.getIdOf(eventClickArg.event);
    this.events.set(this.events().filter((event) => event.id !== idOfRemoved));
  }
  private addEvent(dateSelectArg: EventDescriptor) {
    if (!this.atLeastSessionTime(dateSelectArg)) {
      this.snackBar.open("Time slots can't be less than 75 minutes ❌", undefined, {
        duration: 2_000,
      });
      return;
    }
    const newEvent: EventInput = {
      title: this.title(),
      start: dateSelectArg.start!,
      end: dateSelectArg.end!,
      color: 'lightblue',
      id: this.getIdOf(dateSelectArg),
    };
    this.events.set([...this.events(), newEvent]);
  }
  private getIdOf(eventDescriptor: EventDescriptor): string {
    return this.timeIntervalFactory.createOf(eventDescriptor).toString();
  }
  private changeEvent(eventChangeArg: EventChangeArg): void {
    if (!this.atLeastSessionTime(eventChangeArg.event)) {
      eventChangeArg.revert();
      this.snackBar.open("Time slots can't be less than 75 minutes ❌", undefined, {
        duration: 2_000,
      });
      return;
    }

    this.removeEvent({ event: eventChangeArg.oldEvent });
    this.addEvent(eventChangeArg.event);
  }
  private atLeastSessionTime(eventDesc: EventDescriptor): boolean {
    const timeSpanInMilliSeconds = eventDesc.end!.valueOf() - eventDesc.start!.valueOf();
    return timeSpanInMilliSeconds >= sessionSpan.inMilliSeconds;
  }
}
