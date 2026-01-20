import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project-details',
  imports: [],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails implements OnInit {
  projectId!: number;

  project = {
    name: 'Website Redesign',
    client: 'Ahmed',
    status: 'In Progress',
    description: 'Redesigning the company website with a modern UI and better UX.',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit() {
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
  }

  back() {
    this.router.navigate(['/admin/projects']);
  }
}
