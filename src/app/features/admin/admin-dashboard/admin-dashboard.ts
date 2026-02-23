import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ChartCard } from '../../../shared/components/chart-card/chart-card';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { UsersService } from '../../../core/services/users-service/users-service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, ChartCard],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboard implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  isLoading = true;

  totalClients = 0;
  totalProjects = 0;
  activeProjects = 0;
  completedProjects = 0;
  pendingProjects = 0;

  latestProjects: any[] = [];

  pieData: number[] = [];
  lineData: number[] = [];

  constructor(
    private usersService: UsersService,
    private projectsService: ProjectsService,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboard();
    }
  }

  loadDashboard() {
    this.isLoading = true;

    // Load clients count
    this.usersService.getAllUsers().subscribe({
      next: (res) => {
        this.totalClients = res.totalCount || res.data?.length || 0;
        this.cdr.detectChanges();
      },
      error: () => {},
    });

    // Load projects
    this.projectsService.getAllProjects(1, 100).subscribe({
      next: (res) => {
        const projects = res.data || [];
        this.totalProjects = res.totalCount || projects.length;
        this.activeProjects = projects.filter((p: any) => p.status === 'active').length;
        this.completedProjects = projects.filter((p: any) => p.status === 'completed').length;
        this.pendingProjects = projects.filter((p: any) => p.status === 'pending').length;
        this.latestProjects = projects.slice(0, 5);

        // Chart data
        this.pieData = [this.activeProjects, this.completedProjects, this.pendingProjects];
        this.lineData = this.buildLineData(projects);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buildLineData(projects: any[]): number[] {
    // Group by month (last 6 months)
    const months: number[] = new Array(6).fill(0);
    const now = new Date();
    projects.forEach((p: any) => {
      const date = new Date(p.createdAt);
      const diff =
        (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
      if (diff >= 0 && diff < 6) {
        months[5 - diff]++;
      }
    });
    return months;
  }

  get completionRate(): number {
    if (!this.totalProjects) return 0;
    return Math.round((this.completedProjects / this.totalProjects) * 100);
  }
}
