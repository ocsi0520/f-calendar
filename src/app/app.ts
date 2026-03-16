import { Component, inject } from '@angular/core';
import { AppTabSelector } from '../tabs/app-tab-selector/app-tab-selector';
import { MatButtonModule } from '@angular/material/button';
import { DemoService } from './Demo.service';

@Component({
  selector: 'app-root',
  imports: [AppTabSelector, MatButtonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private demoService = inject(DemoService);
  public handleDemoDataInsertion(): void {
    const accept = confirm(
      'Are you sure you want to fill the app with demo data? This will override your previous data.',
    );
    if (!accept) return;

    this.demoService.injectData();
    window.location.reload();
  }
}
