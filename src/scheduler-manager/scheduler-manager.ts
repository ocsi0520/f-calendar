import {
  Component,
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
  DateSelectArg,
  EventClickArg,
  EventInput,
} from '@fullcalendar/core/index.js';
import { EventDescriptor, TimeIntervalFactory } from '../time/TimeInterval';
import { WeekSchedule } from '../time/Schedule';
import { ClientService } from '../client/client.service';
import { baseCalendarOptions } from './base-calendar-options';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-scheduler-manager',
  imports: [FullCalendarModule, MatButtonModule],
  templateUrl: './scheduler-manager.html',
  styleUrl: './scheduler-manager.scss',
})
export class SchedulerManager implements OnChanges {
  public reset(): void {
    this.events.set(
      this.initialWeekSchedule().map((timeInterval) =>
        timeInterval.toEventWith(new Date(), this.title()),
      ),
    );
  }
  public save() {
    this.saveNewSchedule.emit(
      this.events().map((event) => this.timeIntervalFactory.createOf(event as EventDescriptor)),
    );
  }
  timeIntervalFactory = inject(TimeIntervalFactory);
  clientService = inject(ClientService);

  public events: WritableSignal<EventInput[]> = signal([]);

  public initialWeekSchedule = input.required<WeekSchedule>();
  public title = input.required<string>();

  public saveNewSchedule = output<WeekSchedule>();

  public ngOnChanges(changes: SimpleChanges<typeof this>): void {
    const changeOfSchedule = changes['initialWeekSchedule'];
    if (changeOfSchedule)
      this.events.set(
        changeOfSchedule.currentValue.map((timeInterval) =>
          timeInterval.toEventWith(new Date(), this.title()),
        ),
      );
  }

  public calendarOptions: CalendarOptions = {
    ...baseCalendarOptions,
    eventClick: this.removeEvent.bind(this),
    select: this.addEvent.bind(this),
  };

  private removeEvent(eventClickArg: EventClickArg) {
    const idOfRemoved = this.getIdOf(eventClickArg.event);
    this.events.set(this.events().filter((event) => event.id !== idOfRemoved));
  }
  private addEvent(dateSelectArg: DateSelectArg) {
    const newEvent: EventInput = {
      title: this.title(),
      start: dateSelectArg.start,
      end: dateSelectArg.end,
      color: 'lightblue',
      id: this.getIdOf(dateSelectArg),
    };
    this.events.set([...this.events(), newEvent]);
  }
  private getIdOf(eventDescriptor: EventDescriptor): string {
    return this.timeIntervalFactory.createOf(eventDescriptor).toString();
  }
}
