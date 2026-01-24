import { Component } from '@angular/core';
import { ChartCard } from '../../../shared/components/chart-card/chart-card';

@Component({
  selector: 'app-admin-dashboard',
  imports: [ChartCard],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard {
  totalClients = 12;
  totalProjects = 28;
  activeProjects = 10;
  completedProjects = 14;

  pieData = [10, 14, 4];
  lineData = [10, 20, 35, 50, 65, 80];
}
