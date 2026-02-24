import { CommonModule, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../../environments/environment';
interface Installment {
  id: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
}
@Component({
  selector: 'app-financials',
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './financials.html',
  styleUrl: './financials.css',
})
export class Financials implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  project: any = null;
  isLoading = true;

  // Public properties — مش getters عشان Angular template يشوفها
  totalAmount = 0;
  paidAmount = 0;
  remainingAmount = 0;
  paymentProgress = 0;
  installments: any[] = [];
  financialDetails: any = {};

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private authServices: AuthServices,
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const projectId = this.route.parent?.snapshot.paramMap.get('id');
      const user = this.authServices.getUser();
      if (!user?._id) {
        this.isLoading = false;
        return;
      }

      this.loadingService.show('Loading financials...');
      this.projectsService.getUserProjects(user._id).subscribe({
        next: (res) => {
          this.project = (res.data || []).find((p: any) => p._id === projectId) || null;
          this.computeFinancials();
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

  computeFinancials() {
    this.financialDetails = this.project?.financialDetails || {};
    this.totalAmount = this.financialDetails.totalAmount || 0;
    this.installments = this.financialDetails.installments || [];
    this.paidAmount = this.installments.reduce((s: number, i: any) => s + (i.amount || 0), 0);
    this.remainingAmount = this.totalAmount - this.paidAmount;
    this.paymentProgress = this.totalAmount
      ? Math.round((this.paidAmount / this.totalAmount) * 100)
      : 0;
  }
}
