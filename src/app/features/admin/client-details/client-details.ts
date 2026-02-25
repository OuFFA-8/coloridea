import {
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UsersService } from '../../../core/services/users-service/users-service';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { environment } from '../../../../environments/environment';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

const CLIENTS_KEY = makeStateKey<any[]>('clients');

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslateModule],
  templateUrl: './client-details.html',
  styleUrl: './client-details.css',
})
export class ClientDetails implements OnInit {
  client: any = null;
  isLoading = true;
  isSaving = false;
  baseUrl = environment.baseUrl;
  showProjectModal = false;
  projectForm: FormGroup;
  projectPhotoFile: File | null = null;
  projectPhotoPreview: string | null = null;

  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);
  private loadingService = inject(LoadingService);

  constructor(
    private route: ActivatedRoute,
    private usersService: UsersService,
    private projectsService: ProjectsService,
    private alert: AlertService,
    private transferState: TransferState,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      totalAmount: [null, [Validators.required, Validators.min(1)]],
      totalInstallments: [1, [Validators.required, Validators.min(1)]],
      installments: this.fb.array([]),
      agreedItems: this.fb.array([]),
    });
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = this.route.snapshot.paramMap.get('id');

    if (this.transferState.hasKey(CLIENTS_KEY)) {
      const clients = this.transferState.get(CLIENTS_KEY, []);
      this.client = clients.find((c: any) => c._id === id) || null;
      if (this.client) {
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }
    }

    this.loadingService.show('Loading client...');
    this.usersService.getAllUsers().subscribe({
      next: (res) => {
        this.client = res.data.find((c: any) => c._id === id) || null;
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        if (!this.client) this.alert.error('Client not found');
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.error(err.error?.message || 'Failed to load client');
      },
    });
  }

  openProject(id: string) {
    this.router.navigate(['/admin/projects', id]);
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  get installmentsControls() {
    return (this.projectForm.get('installments') as FormArray).controls;
  }
  addInstallment() {
    (this.projectForm.get('installments') as FormArray).push(
      this.fb.group({
        amount: [null, [Validators.required, Validators.min(1)]],
        createdAt: ['', Validators.required],
      }),
    );
  }
  removeInstallment(index: number) {
    (this.projectForm.get('installments') as FormArray).removeAt(index);
  }

  get agreedItemsControls() {
    return (this.projectForm.get('agreedItems') as FormArray).controls;
  }
  addAgreedItem() {
    (this.projectForm.get('agreedItems') as FormArray).push(
      this.fb.group({
        name: ['', Validators.required],
        numberOfItems: [1, [Validators.required, Validators.min(1)]],
      }),
    );
  }
  removeAgreedItem(index: number) {
    (this.projectForm.get('agreedItems') as FormArray).removeAt(index);
  }

  onProjectPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.projectPhotoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.projectPhotoPreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  toggleProjectModal() {
    this.showProjectModal = !this.showProjectModal;
    if (this.showProjectModal) {
      this.projectForm.reset({ totalInstallments: 1 });
      (this.projectForm.get('installments') as FormArray).clear();
      (this.projectForm.get('agreedItems') as FormArray).clear();
      this.addInstallment();
      this.addAgreedItem();
      this.projectPhotoFile = null;
      this.projectPhotoPreview = null;
    }
  }

  saveProject() {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    this.loadingService.show('Creating project...');
    const formData = new FormData();
    const val = this.projectForm.value;
    formData.append('name', val.name);
    formData.append('description', val.description);
    formData.append('user', this.client._id);
    formData.append('totalAmount', val.totalAmount);
    formData.append('totalInstallments', val.totalInstallments);
    if (this.projectPhotoFile) formData.append('photo', this.projectPhotoFile);
    val.installments.forEach((inst: any, i: number) => {
      formData.append(`installments[${i}][amount]`, inst.amount);
      formData.append(`installments[${i}][createdAt]`, inst.createdAt);
    });
    val.agreedItems.forEach((item: any, i: number) => {
      formData.append(`agreedItems[${i}][name]`, item.name);
      formData.append(`agreedItems[${i}][numberOfItems]`, item.numberOfItems);
    });

    this.projectsService.createProject(formData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.client.projects = [...(this.client.projects || []), res.data];
        this.client.projectsCount = (this.client.projectsCount || 0) + 1;
        this.toggleProjectModal();
        this.cdr.detectChanges();
        this.alert.success(`Project "${res.data.name}" created successfully!`);
      },
      error: (err) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Failed to create project');
      },
    });
  }
}
