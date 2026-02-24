import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectsService } from '../../../core/services/projects-service/projects-service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../core/services/alert-service/alert-service';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { OutputsService } from '../../../core/services/outputs-service/outputs-service';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-admin-project-details',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './admin-project-details.html',
  styleUrl: './admin-project-details.css',
})
export class AdminProjectDetails implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  private loadingService = inject(LoadingService);

  project: any = null;
  outputs: any[] = [];
  isLoading = true;
  isSaving = false;
  baseUrl = environment.baseUrl;

  showEditProjectModal = false;
  showAddOutputModal = false;
  showEditOutputModal = false;
  showAddItemModal = false;
  showItemPreviewModal = false;
  showAddInstallmentModal = false;
  showEditInstallmentModal = false;

  selectedOutput: any = null;
  selectedItem: any = null;
  selectedInstallment: any = null;

  editProjectForm: FormGroup;
  outputForm: FormGroup;
  editOutputForm: FormGroup;
  itemForm: FormGroup;
  installmentForm: FormGroup;

  projectPhotoFile: File | null = null;
  projectPhotoPreview: string | null = null;
  itemPhotoFile: File | null = null;
  itemPhotoPreview: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsService,
    private outputsService: OutputsService,
    private alert: AlertService,
    private fb: FormBuilder,
  ) {
    this.editProjectForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      status: [''],
    });
    this.outputForm = this.fb.group({
      name: ['', Validators.required],
      numberOfItems: [1, [Validators.required, Validators.min(1)]],
    });
    this.editOutputForm = this.fb.group({
      numberOfItems: [1, [Validators.required, Validators.min(1)]],
    });
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      link: ['', Validators.required],
    });
    this.installmentForm = this.fb.group({
      amount: [null, [Validators.required, Validators.min(1)]],
      createdAt: ['', Validators.required],
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) this.loadProject();
  }

  loadProject() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.isLoading = true;
    this.loadingService.show('Loading project...');
    this.projectsService.getProjectById(id).subscribe({
      next: (res) => {
        this.project = res.data;
        this.outputs = res.data.outputs || [];
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.error(err.error?.message || 'Failed to load project');
      },
    });
  }

  getPhotoUrl(path: string | null): string {
    return path ? `${this.baseUrl}/${path.replace(/\\/g, '/')}` : '';
  }

  get paidAmount(): number {
    return (
      this.project?.financialDetails?.installments?.reduce(
        (sum: number, i: any) => sum + i.amount,
        0,
      ) || 0
    );
  }
  get outputsProgress(): number {
    if (!this.outputs.length) return 0;
    const total = this.outputs.reduce((s, o) => s + o.numberOfItems, 0);
    const delivered = this.outputs.reduce((s, o) => s + o.items.length, 0);
    return total ? Math.round((delivered / total) * 100) : 0;
  }
  get remainingAmount(): number {
    return (this.project?.financialDetails?.totalAmount || 0) - this.paidAmount;
  }
  get paymentProgress(): number {
    const t = this.project?.financialDetails?.totalAmount || 0;
    return t ? Math.round((this.paidAmount / t) * 100) : 0;
  }

  openEditProjectModal() {
    this.editProjectForm.patchValue({
      name: this.project.name,
      description: this.project.description || '',
      status: this.project.status || 'pending',
    });
    this.projectPhotoFile = null;
    this.projectPhotoPreview = null;
    this.showEditProjectModal = true;
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

  saveEditProject() {
    if (this.editProjectForm.invalid) return;
    this.isSaving = true;
    this.loadingService.show('Saving project...');
    const formData = new FormData();
    const val = this.editProjectForm.value;
    formData.append('name', val.name);
    formData.append('description', val.description);
    formData.append('status', val.status);
    if (this.projectPhotoFile) formData.append('photo', this.projectPhotoFile);
    this.projectsService.updateProject(this.project._id, formData).subscribe({
      next: (res) => {
        this.project = { ...this.project, ...res.data };
        this.showEditProjectModal = false;
        this.isSaving = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.success('Project updated successfully');
      },
      error: (err) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Failed to update project');
      },
    });
  }

  openAddOutputModal() {
    this.outputForm.reset({ numberOfItems: 1 });
    this.showAddOutputModal = true;
  }

  saveOutput() {
    if (this.outputForm.invalid) return;
    this.isSaving = true;
    this.loadingService.show('Adding output...');
    this.outputsService.createOutput(this.project._id, this.outputForm.value).subscribe({
      next: (res) => {
        this.outputs.unshift(res.data);
        this.showAddOutputModal = false;
        this.isSaving = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.success('Output created successfully');
      },
      error: (err) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Failed to create output');
      },
    });
  }

  openEditOutputModal(output: any) {
    this.selectedOutput = output;
    this.editOutputForm.patchValue({ numberOfItems: output.numberOfItems });
    this.showEditOutputModal = true;
  }

  saveEditOutput() {
    if (this.editOutputForm.invalid) return;
    this.isSaving = true;
    this.loadingService.show('Updating output...');
    this.outputsService.updateOutput(this.selectedOutput._id, this.editOutputForm.value).subscribe({
      next: (res) => {
        const idx = this.outputs.findIndex((o) => o._id === this.selectedOutput._id);
        if (idx !== -1) this.outputs[idx] = { ...this.outputs[idx], ...res.data };
        this.showEditOutputModal = false;
        this.isSaving = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.success('Output updated successfully');
      },
      error: (err) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Failed to update output');
      },
    });
  }

  deleteOutput(output: any) {
    this.alert.confirm(`Delete "${output.name}"?`).then((result: any) => {
      if (result.isConfirmed) {
        this.loadingService.show('Deleting output...');
        this.outputsService.deleteOutput(output._id).subscribe({
          next: () => {
            this.outputs = this.outputs.filter((o) => o._id !== output._id);
            this.loadingService.hide();
            this.cdr.detectChanges();
            this.alert.success('Output deleted');
          },
          error: (err) => {
            this.loadingService.hide();
            this.alert.error(err.error?.message || 'Failed to delete output');
          },
        });
      }
    });
  }

  openAddItemModal(output: any) {
    this.selectedOutput = output;
    this.itemForm.reset();
    this.itemPhotoFile = null;
    this.itemPhotoPreview = null;
    this.showAddItemModal = true;
  }

  onItemPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.itemPhotoFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.itemPhotoPreview = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  saveItem() {
    if (this.itemForm.invalid) return;
    this.isSaving = true;
    this.loadingService.show('Adding item...');
    const formData = new FormData();
    formData.append('name', this.itemForm.value.name);
    formData.append('link', this.itemForm.value.link);
    if (this.itemPhotoFile) formData.append('photo', this.itemPhotoFile);
    this.outputsService.addItem(this.selectedOutput._id, formData).subscribe({
      next: (res) => {
        const output = this.outputs.find((o) => o._id === this.selectedOutput._id);
        if (output) output.items.push(res.data);
        this.showAddItemModal = false;
        this.isSaving = false;
        this.loadingService.hide();
        this.cdr.detectChanges();
        this.alert.success('Item added successfully');
      },
      error: (err) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Failed to add item');
      },
    });
  }

  openItemPreview(item: any) {
    this.selectedItem = item;
    this.showItemPreviewModal = true;
  }

  openAddInstallmentModal() {
    this.installmentForm.reset();
    this.showAddInstallmentModal = true;
  }

  saveInstallment() {
    if (this.installmentForm.invalid) return;
    this.isSaving = true;
    this.loadingService.show('Adding installment...');
    this.projectsService.addInstallment(this.project._id, this.installmentForm.value).subscribe({
      next: () => {
        this.showAddInstallmentModal = false;
        this.isSaving = false;
        this.loadingService.hide();
        this.loadProject();
        this.alert.success('Installment added successfully');
      },
      error: (err) => {
        this.isSaving = false;
        this.loadingService.hide();
        this.alert.error(err.error?.message || 'Failed to add installment');
      },
    });
  }

  openEditInstallmentModal(installment: any) {
    this.selectedInstallment = installment;
    this.installmentForm.patchValue({
      amount: installment.amount,
      createdAt: installment.createdAt?.split('T')[0] || '',
    });
    this.showEditInstallmentModal = true;
  }

  saveEditInstallment() {
    if (this.installmentForm.invalid) return;
    this.isSaving = true;
    this.loadingService.show('Updating installment...');
    this.projectsService
      .updateInstallment(this.selectedInstallment._id, this.installmentForm.value)
      .subscribe({
        next: () => {
          this.showEditInstallmentModal = false;
          this.isSaving = false;
          this.loadingService.hide();
          this.loadProject();
          this.alert.success('Installment updated');
        },
        error: (err) => {
          this.isSaving = false;
          this.loadingService.hide();
          this.alert.error(err.error?.message || 'Failed to update installment');
        },
      });
  }

  deleteInstallment(installment: any) {
    this.alert.confirm('Delete this installment?').then((result: any) => {
      if (result.isConfirmed) {
        this.loadingService.show('Deleting installment...');
        this.projectsService.deleteInstallment(installment._id).subscribe({
          next: () => {
            this.loadingService.hide();
            this.loadProject();
            this.alert.success('Installment deleted');
          },
          error: (err) => {
            this.loadingService.hide();
            this.alert.error(err.error?.message || 'Failed to delete installment');
          },
        });
      }
    });
  }
}
