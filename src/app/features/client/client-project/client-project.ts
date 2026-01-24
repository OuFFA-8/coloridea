import { ProjectsServices } from './../../../core/services/projects-services';
import { Project } from './../../../core/models/project';
import { Component, OnInit } from '@angular/core';
import { ProjectCard } from '../../../shared/components/project-card/project-card';
import { Router } from '@angular/router'; // 1. استيراد الـ Router

@Component({
  selector: 'app-client-project',
  standalone: true, // تأكد إنها Standalone لو بتستخدم imports مباشرة
  imports: [],
  templateUrl: './client-project.html',
  styleUrl: './client-project.css',
})
export class ClientProject implements OnInit {
  projects: Project[] = [];

  // 2. إضافة الـ Router في الـ constructor
  constructor(
    private projectsService: ProjectsServices,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // يفضل الـ ID يجي من الـ Auth service بس حالياً هنثبته زي ما أنت عامل
    this.projects = this.projectsService.getByClient(1);
  }

  // 3. تعريف الدالة اللي الـ HTML بيدور عليها
  openDetails(projectId: number | string): void {
    // هينقلك لصفحة التفاصيل (تأكد إن المسار ده متعرّف في الـ App Routing)
    this.router.navigate(['/client/projects', projectId]);
  }
}
