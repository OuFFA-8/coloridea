import {
  ChangeDetectorRef,
  Component,
  OnInit,
  PLATFORM_ID,
  TransferState,
  inject,
  makeStateKey,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { UsersService } from '../../../core/services/users-service/users-service';
import { environment } from '../../../../environments/environment';
import { AlertService } from '../../../core/services/alert-service/alert-service';
const CLIENTS_KEY = makeStateKey<any[]>('clients');

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  showModal = false;
  isLoading = true;
  isSaving = false;
  clientForm: FormGroup;
  clients: any[] = [];
  baseUrl = environment.baseUrl;

  logoFile: File | null = null;
  patternFile: File | null = null;
  photoFile: File | null = null;
  logoPreview: string | null = null;
  patternPreview: string | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private usersService: UsersService,
    private alert: AlertService,
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit() {
    // نعمل الـ request على الـ browser بس — مش على الـ SSR
    if (isPlatformBrowser(this.platformId)) {
      this.loadClients();
    }
  }

  loadClients() {
    this.isLoading = true;
    this.usersService.getAllUsers().subscribe({
      next: (res) => {
        this.clients = [...res.data];
        this.isLoading = false;
        this.cdr.detectChanges(); // 👈 وده
      },
      error: (err) => {
        this.isLoading = false;
        this.cdr.detectChanges(); // 👈 وده
        this.alert.error(err.error?.message || 'Failed to load clients');
      },
    });
  }
  getPhotoUrl(path: string | null): string {
    if (!path) return 'images/default-avatar.png';
    return `${this.baseUrl}/${path.replace(/\\/g, '/')}`;
  }

  toggleModal() {
    this.showModal = !this.showModal;
    if (!this.showModal) this.resetForm();
  }

  openClient(id: string) {
    this.router.navigate(['/admin/clients', id]);
  }

  onFileSelected(event: any, type: 'logo' | 'pattern' | 'photo') {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (type === 'logo') {
        this.logoPreview = result;
        this.logoFile = file;
      } else if (type === 'pattern') {
        this.patternPreview = result;
        this.patternFile = file;
      } else {
        this.photoFile = file;
      }
    };
    reader.readAsDataURL(file);
  }

  saveClient() {
    if (this.clientForm.invalid) return;
    this.isSaving = true;
    const formData = new FormData();
    formData.append('name', this.clientForm.value.name);
    formData.append('email', this.clientForm.value.email);
    formData.append('password', this.clientForm.value.password);
    if (this.logoFile) formData.append('logo', this.logoFile);
    if (this.patternFile) formData.append('pattern', this.patternFile);
    if (this.photoFile) formData.append('photo', this.photoFile);

    this.usersService.createUser(formData).subscribe({
      next: (res) => {
        this.isSaving = false;
        this.clients.unshift(res.data);
        this.toggleModal();
        this.alert.success(`"${res.data.name}" has been added successfully`);
      },
      error: (err) => {
        this.isSaving = false;
        this.alert.error(err.error?.message || 'Failed to create client');
      },
    });
  }

  deleteClient(event: Event, id: string, name: string) {
    event.stopPropagation();
    this.alert.confirm(`Are you sure you want to delete "${name}"?`).then((result: any) => {
      if (result.isConfirmed) {
        this.usersService.deleteUser(id).subscribe({
          next: () => {
            this.clients = this.clients.filter((c) => c._id !== id);
            this.alert.success(`"${name}" deleted successfully`);
          },
          error: (err) => {
            this.alert.error(err.error?.message || 'Failed to delete client');
          },
        });
      }
    });
  }

  resetForm() {
    this.clientForm.reset();
    this.logoFile = null;
    this.patternFile = null;
    this.photoFile = null;
    this.logoPreview = null;
    this.patternPreview = null;
  }
}
