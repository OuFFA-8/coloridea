import { ProjectsServices } from './../../../core/services/projects-services';
import { Project } from './../../../core/models/project';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // مهم جداً للـ classes والـ pipes

@Component({
  selector: 'app-client-project',
  standalone: true,
  imports: [CommonModule], // ضفنا CommonModule هنا
  templateUrl: './client-project.html',
  styleUrl: './client-project.css',
})
export class ClientProject implements OnInit {
  allProjects: Project[] = []; // المصدر الأصلي
  filteredProjects: Project[] = []; // اللي بيتعرض فعلاً
  currentFilter: string = 'All';

  constructor(
    private projectsService: ProjectsServices,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // تحميل البيانات لأول مرة
    this.allProjects = this.projectsService.getByClient(1);
    this.filteredProjects = [...this.allProjects]; // في البداية نعرض الكل
  }

  setFilter(status: string): void {
    this.currentFilter = status;

    if (status === 'All') {
      this.filteredProjects = [...this.allProjects];
    } else {
      this.filteredProjects = this.allProjects.filter((p) => {
        const pStatus = p.status.toLowerCase().trim();
        const fStatus = status.toLowerCase().trim();

        // لو بنفلتر على Completed، نعتبر الـ Completed بس
        // لو بنفلتر على Active، نعتبر الـ Active بس
        // ضفت لك شرط الـ pending عشان يظهر مع الـ Active أو لو حبيت تعمله زرار لوحده
        return pStatus === fStatus;
      });
    }
  }

  openDetails(projectId: number | string): void {
    this.router.navigate(['/client/projects', projectId]);
  }
}
