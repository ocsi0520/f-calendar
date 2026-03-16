import { Component, inject, signal } from '@angular/core';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AllowedSpecificationsService } from '../../time-management/ScheduleGenerator/specification/allowance/AllowedSpecifications.service';
import { AllowedSpecificationsDescriptor } from '../../time-management/ScheduleGenerator/specification/allowance/AllowedSpecificationsDescriptor';

@Component({
  selector: 'app-pick-rules',
  imports: [MatSlideToggleModule],
  templateUrl: './pick-rules.html',
  styleUrl: './pick-rules.scss',
})
export class PickRules {
  private specAllowance = inject(AllowedSpecificationsService);
  public descriptor = signal(this.specAllowance.load());

  private getEventHandlerFor(
    key: keyof AllowedSpecificationsDescriptor,
  ): (toggleChange: MatSlideToggleChange) => void {
    return (event) => {
      const changed = { ...this.descriptor(), [key]: event.checked };
      this.specAllowance.save(changed);
      this.descriptor.set(changed);
    };
  }

  public toggleBreakfast = this.getEventHandlerFor('breakfast');
  public toggleLunch = this.getEventHandlerFor('lunch');
  public toggleNoFollowingDay = this.getEventHandlerFor('noFollowingDayFor2Sessions');
}
