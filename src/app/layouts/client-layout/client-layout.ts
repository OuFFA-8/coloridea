import { Component } from '@angular/core';
import { Sidebar } from "../../shared/components/sidebar/sidebar";
import { Header } from "../../shared/components/header/header";
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-client-layout',
  imports: [Sidebar, Header, RouterOutlet],
  templateUrl: './client-layout.html',
  styleUrl: './client-layout.css',
})
export class ClientLayout {

}
