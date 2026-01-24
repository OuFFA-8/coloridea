import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-clients',
  imports: [],
  templateUrl: './clients.html',
  styleUrl: './clients.css',
})
export class Clients {
  constructor(private router: Router) {}

  clients = [
    { id: 1, name: 'Ahmed Ali', email: 'ahmed@mail.com', projects: 3 },
    { id: 2, name: 'Sara Mohamed', email: 'sara@mail.com', projects: 2 },
    { id: 3, name: 'Omar Khaled', email: 'omar@mail.com', projects: 5 },
  ];

  openClient(id: number) {
    this.router.navigate(['/admin/clients', id]);
  }
}
