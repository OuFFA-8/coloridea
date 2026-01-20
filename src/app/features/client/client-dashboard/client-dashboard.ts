import { Component } from '@angular/core';

@Component({
  selector: 'app-client-dashboard',
  imports: [],
  templateUrl: './client-dashboard.html',
  styleUrl: './client-dashboard.css',
})
export class ClientDashboard {
  kpis = [
    { title: 'Total Services', value: '7' },
    { title: 'Completed', value: '3' },
    { title: 'In Progress', value: '3' },
    { title: 'Overall Progress', value: '45%' },
  ];

  services = [
    { name: 'Aerial Sessions', planned: 4, done: 2, progress: 50, status: 'In Progress', statusColor: 'bg-yellow-500' },
    { name: 'Ground Sessions', planned: 4, done: 4, progress: 100, status: 'Done', statusColor: 'bg-green-500' },
    { name: 'Timelapse', planned: 1, done: 1, progress: 100, status: 'Active', statusColor: 'bg-green-500' },
    { name: 'Monthly Videos', planned: 12, done: 5, progress: 42, status: 'In Progress', statusColor: 'bg-yellow-500' },
    { name: 'Quarterly Videos', planned: 4, done: 1, progress: 25, status: 'In Progress', statusColor: 'bg-yellow-500' },
    { name: 'Photography', planned: 12, done: 6, progress: 50, status: 'In Progress', statusColor: 'bg-yellow-500' },
    { name: 'Final Video', planned: 1, done: 0, progress: 0, status: 'Pending', statusColor: 'bg-gray-500' },
  ];
}
