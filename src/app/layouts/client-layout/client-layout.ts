import { Component } from '@angular/core';
import { Header } from '../../shared/components/header/header';
import { RouterOutlet } from '@angular/router';
import { ClientSidebar } from '../../shared/components/client-sidebar/client-sidebar';
import { Footer } from '../../shared/components/footer/footer';

@Component({
  selector: 'app-client-layout',
  imports: [ClientSidebar, Header, RouterOutlet, Footer],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css',
})
export class ClientLayout {}
