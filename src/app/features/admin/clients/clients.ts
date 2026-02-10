import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProjectsServices } from '../../../core/services/projects-services'; // استيراد السيرفس

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients implements OnInit {
  showModal = false;
  clientForm: FormGroup;
  logoPreview: string | null = null;
  patternPreview: string | null = null;
  clients: any[] = [
    {
      id: 1,
      nameEn: 'Skyline Real Estate',
      nameAr: 'سكاي لاين العقارية',
      email: 'info@skyline.com',
      projectsCount: 3,
      logo: 'https://cdn-icons-png.flaticon.com/512/2102/2102633.png',
      pattern: 'bg-blue-600',
    },
    {
      id: 2,
      nameEn: 'Modern Designs',
      nameAr: 'مودرن ديزاينز',
      email: 'contact@modern.com',
      projectsCount: 2,
      logo: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
      pattern: 'bg-emerald-600',
    },
  ]; // هنملاها من السيرفس

  // خيارات الباترن للأدمن
  patterns = [
    { id: 'bg-blue-600', color: 'bg-blue-600' },
    { id: 'bg-emerald-600', color: 'bg-emerald-600' },
    { id: 'bg-purple-600', color: 'bg-purple-600' },
    { id: 'bg-rose-600', color: 'bg-rose-600' },
  ];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private projectsService: ProjectsServices, // حقن السيرفس
  ) {
    this.clientForm = this.fb.group({
      nameEn: ['', [Validators.required]],
      nameAr: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      patternId: ['bg-blue-600'],
    });
  }

  ngOnInit() {
    this.loadClients(); // تحميل البيانات عند التشغيل
  }

  loadClients() {
    this.clients = this.projectsService.getClients();
  }

  toggleModal() {
    this.showModal = !this.showModal;
  }

  openClient(id: number) {
    this.router.navigate(['/admin/clients', id]);
  }

  onFileSelected(event: any, type: 'logo' | 'pattern') {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        if (type === 'logo') {
          this.logoPreview = result;
          this.clientForm.patchValue({ logoUrl: result });
        } else {
          this.patternPreview = result;
          this.clientForm.patchValue({ patternId: result }); // هنا الباترن بقى رابط صورة
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveClient() {
    if (this.clientForm.valid) {
      const formValue = this.clientForm.value;

      const newClient = {
        nameEn: formValue.nameEn,
        nameAr: formValue.nameAr,
        email: formValue.email,
        password: formValue.password,
        patternId: this.patternPreview || '', // صورة الباترن
        logoUrl: this.logoPreview || '', // صورة اللوجو
      };

      this.projectsService.addClient(newClient);
      this.loadClients();
      this.toggleModal();
      // تصفير الـ Previews
      this.logoPreview = null;
      this.patternPreview = null;
      this.clientForm.reset();
    }
  }
}
