import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../../shared/components/header/header';
import { AdminSidebar } from '../../shared/components/admin-sidebar/admin-sidebar';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterOutlet, AdminSidebar, Header, Footer],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {}
