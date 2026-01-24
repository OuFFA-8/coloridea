import { Component } from '@angular/core';
import { ChartCard } from '../../../shared/components/chart-card/chart-card';

@Component({
  selector: 'app-client-dashboard',
  imports: [ChartCard],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css',
})
export class ClientDashboard {
  projectName = 'New Capital Compound';

  progress = 72;

  services = [
    { name: 'Aerial Photography Sessions', done: 3, total: 4 },
    { name: 'Ground Photography Sessions', done: 2, total: 4 },
    { name: 'Timelapse Camera', done: 1, total: 1 },
    { name: 'Monthly Update Videos', done: 8, total: 12 },
    { name: 'Quarterly Edited Videos', done: 2, total: 4 },
    { name: 'Photo Sessions', done: 10, total: 12 },
  ];

  chartData = [72, 28];
}
