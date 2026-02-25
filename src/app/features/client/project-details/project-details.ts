import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ChartCard } from './../../../shared/components/chart-card/chart-card';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, ChartCard, TranslateModule, RouterLink],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  project: any = null;
  isLoading = true;
  pieData: number[] = [];
  lineData: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private authServices: AuthServices,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const projectId = this.route.snapshot.paramMap.get('id');
      const user = this.authServices.getUser();
      if (!projectId || !user?._id) {
        this.isLoading = false;
        return;
      }
      this.loadingService.show('Loading project...');
      this.projectsService.getUserProjects(user._id).subscribe({
        next: (res) => {
          this.project = (res.data || []).find((p: any) => p._id === projectId) || null;
          if (this.project) this.buildChartData();
          this.isLoading = false;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.loadingService.hide();
          this.cdr.detectChanges();
        },
      });
    }
  }

  buildChartData() {
    this.pieData = [this.deliveredItems, Math.max(0, this.totalItems - this.deliveredItems)];
    this.lineData = this.project.outputs?.map((o: any) => o.items?.length || 0) || [];
  }

  get totalItems(): number {
    return this.project?.outputs?.reduce((s: number, o: any) => s + (o.numberOfItems || 0), 0) || 0;
  }
  get deliveredItems(): number {
    return this.project?.outputs?.reduce((s: number, o: any) => s + (o.items?.length || 0), 0) || 0;
  }
  get outputsProgress(): number {
    return this.totalItems ? Math.round((this.deliveredItems / this.totalItems) * 100) : 0;
  }
  get paidAmount(): number {
    return (
      this.project?.financialDetails?.installments?.reduce(
        (s: number, i: any) => s + (i.amount || 0),
        0,
      ) || 0
    );
  }
  get remainingAmount(): number {
    return (this.project?.financialDetails?.totalAmount || 0) - this.paidAmount;
  }
  get paymentProgress(): number {
    const t = this.project?.financialDetails?.totalAmount || 0;
    return t ? Math.round((this.paidAmount / t) * 100) : 0;
  }
}
