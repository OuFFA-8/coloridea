import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-client-details',
  imports: [],
  templateUrl: './client-details.html',
  styleUrl: './client-details.css',
})
export class ClientDetails implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  clientId!: number;

  client!: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };

  projects: any[] = [];

  ngOnInit() {
    this.clientId = Number(this.route.snapshot.paramMap.get('id'));

    this.client = {
      id: this.clientId,
      name: 'Ahmed Ali',
      email: 'ahmed@mail.com',
      phone: '01000000000',
    };

    this.projects = [
      { id: 1, name: 'Website Redesign', status: 'active', progress: 65 },
      { id: 2, name: 'Mobile App', status: 'completed', progress: 100 },
      { id: 3, name: 'Dashboard System', status: 'pending', progress: 20 },
    ];
  }

  openProject(id: number) {
    this.router.navigate(['/admin/projects', id]);
  }
}
