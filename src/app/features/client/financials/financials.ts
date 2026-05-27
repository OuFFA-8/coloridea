import { CommonModule, DatePipe, DecimalPipe, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ScreenshotBtn } from '../../../shared/components/screenshot-btn/screenshot-btn';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthServices } from '../../../core/services/auth-services/auth-services';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-financials',
  standalone: true,
  imports: [CommonModule, DecimalPipe, DatePipe, TranslateModule, ScreenshotBtn],
  templateUrl: './financials.html',
  styleUrl: './financials.css',
})
export class Financials implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  project: any = null;
  isLoading = true;
  totalAmount = 0;
  paidAmount = 0;
  remainingAmount = 0;
  paymentProgress = 0;
  installments: any[] = [];
  financialDetails: any = {};
  baseUrl = environment.baseUrl;

  showUploadReceiptModal = false;
  selectedInstallmentForReceipt: any = null;
  receiptFile: File | null = null;
  isUploadingReceipt = false;

  private alert = inject(AlertService);
  private http = inject(HttpClient);

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

  private filename(path: string): string {
    return path.split('/').pop() ?? path;
  }

  getContractUrl(): string {
    return this.project?.contract
      ? `${this.baseUrl}/api/v1/files/contracts/${this.filename(this.project.contract)}`
      : '';
  }

  getInvoiceUrl(inst: any): string {
    return inst?.invoice
      ? `${this.baseUrl}/api/v1/files/invoices/${this.filename(inst.invoice)}`
      : '';
  }

  getReceiptUrl(inst: any): string {
    return inst?.receipt
      ? `${this.baseUrl}/api/v1/files/receipts/${this.filename(inst.receipt)}`
      : '';
  }

  openFile(url: string) {
    if (!url) return;
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
        if (!win) this.alert.error('يرجى السماح بالنوافذ المنبثقة');
      },
      error: () => this.alert.error('فشل فتح الملف'),
    });
  }

  openUploadReceiptModal(inst: any) {
    this.selectedInstallmentForReceipt = inst;
    this.receiptFile = null;
    this.showUploadReceiptModal = true;
  }

  onReceiptFileSelected(event: any) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.receiptFile = file;
  }

  uploadReceipt() {
    if (!this.receiptFile) return;
    this.isUploadingReceipt = true;
    const fd = new FormData();
    fd.append('receipt', this.receiptFile);
    this.projectsService
      .uploadUserReceipt(this.selectedInstallmentForReceipt._id, fd)
      .subscribe({
        next: () => {
          this.showUploadReceiptModal = false;
          this.isUploadingReceipt = false;
          this.alert.success('تم رفع الإيصال بنجاح');
          const projectId = this.route.parent?.snapshot.paramMap.get('id');
          const user = this.authServices.getUser();
          if (user?._id) {
            this.projectsService.getUserProjects(user._id).subscribe({
              next: (res) => {
                this.project = (res.data || []).find((p: any) => p._id === projectId) || null;
                this.computeFinancials();
                this.cdr.detectChanges();
              },
            });
          }
        },
        error: (err) => {
          this.isUploadingReceipt = false;
          this.alert.error(err.error?.message || 'فشل رفع الإيصال');
        },
      });
  }

  clearReceipt(inst: any) {
    this.alert.confirm('حذف الإيصال؟').then((result: any) => {
      if (!result.isConfirmed) return;
      this.projectsService.clearUserReceipt(inst._id).subscribe({
        next: () => {
          this.alert.success('تم حذف الإيصال');
          const projectId = this.route.parent?.snapshot.paramMap.get('id');
          const user = this.authServices.getUser();
          if (user?._id) {
            this.projectsService.getUserProjects(user._id).subscribe({
              next: (res) => {
                this.project = (res.data || []).find((p: any) => p._id === projectId) || null;
                this.computeFinancials();
                this.cdr.detectChanges();
              },
            });
          }
        },
        error: (err) => this.alert.error(err.error?.message || 'فشل حذف الإيصال'),
      });
    });
  }
}
