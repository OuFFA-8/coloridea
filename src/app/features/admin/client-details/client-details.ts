import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProjectsServices } from '../../../core/services/projects-services';
// 1. استيراد FormArray
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, CurrencyPipe],
  templateUrl: './client-details.html',
  styleUrl: './client-details.css',
})
export class ClientDetails implements OnInit {
  client: any;
  clientProjects: any[] = [];

  showProjectModal = false;
  projectForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private projectsService: ProjectsServices,
    private fb: FormBuilder,
  ) {
    // 2. تعريف الفورم مع مصفوفة Items فارغة
    this.projectForm = this.fb.group({
      // القسم الأول: البيانات الأساسية
      name: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', Validators.required],

      // القسم الثاني: البنود (Dynamic Array)
      items: this.fb.array([]),
      // القسم الثالث: الماليات
      totalAmount: [null, [Validators.required, Validators.min(1)]],
      installmentsCount: [1, [Validators.required, Validators.min(1)]],
      paidInstallments: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.client = this.projectsService.getClientById(id);
    this.clientProjects = this.projectsService.getByClient(id);
  }

  get itemsControls() {
    const controls = (this.projectForm?.get('items') as FormArray)?.controls;
    return controls || []; // لو مفيش controls رجع مصفوفة فاضية فوراً
  }

  createItem(): FormGroup {
    return this.fb.group({
      itemName: ['', Validators.required], // حقل اسم البند
      count: [1, [Validators.required, Validators.min(1)]], // حقل العدد
    });
  }

  // زرار Add Item بينادي دي
  addItem() {
    const items = this.projectForm.get('items') as FormArray;
    items.push(
      this.fb.group({
        itemName: ['', Validators.required],
        count: [1, [Validators.required, Validators.min(1)]],
      }),
    );
  }

  // زرار الحذف (X)
  removeItem(index: number) {
    const items = this.projectForm.get('items') as FormArray;
    items.removeAt(index);
  }
  // ==================================

  toggleProjectModal() {
    this.showProjectModal = !this.showProjectModal;

    if (this.showProjectModal) {
      // لو فتحنا المودال والبنود فاضية، حط سطر واحد فاضي عشان العميل يفهم
      const items = this.projectForm.get('items') as FormArray;
      if (items.length === 0) {
        this.addItem();
      }
    } else {
      // لو قفلنا، صفر الفورم وامسح البنود عشان المرة الجاية
      this.projectForm.reset({ installmentsCount: 1, paidInstallments: 0 });
      (this.projectForm.get('items') as FormArray).clear();
    }
  }

  // === 4. دالة الحفظ النهائية ===
  saveProject() {
    if (this.projectForm.valid) {
      const formVal = this.projectForm.value;
      const clientId = Number(this.route.snapshot.paramMap.get('id'));

      // حساب المبلغ المتبقي أوتوماتيك
      const remaining = formVal.totalAmount - (formVal.paidInstallments || 0); // (توضيح: هنا بنفترض paidInstallments مبلغ مش عدد أقساط، لو عدد أقساط هنحتاج معادلة تانية)

      // تجهيز الاوبجكت النهائي
      const newProject = {
        clientId: clientId,
        name: formVal.name,
        description: formVal.description,
        status: 'active',
        progress: 0,

        // الداتا الجديدة
        items: formVal.items, // دي هترجع مصفوفة فيها كل البنود
        financials: {
          total: formVal.totalAmount,
          installments: formVal.installmentsCount,
          paid: formVal.paidInstallments,
          remaining: remaining > 0 ? remaining : 0,
        },
      };

      console.log('Sending to Service:', newProject); // للتجربة

      this.projectsService.addProject(newProject);
      this.refreshData();
      this.toggleProjectModal();
    } else {
      // لو الفورم فيه غلطة، علم عليها
      this.projectForm.markAllAsTouched();
    }
  }
}
