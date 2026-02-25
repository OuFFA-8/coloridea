import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading-service/loading-service';

@Component({
  selector: 'app-loading-screen',
  imports: [CommonModule],
  templateUrl: './loading-screen.html',
  styleUrl: './loading-screen.css',
})
export class LoadingScreen {
  public loadingService = inject(LoadingService);

  @Input() visible = false;
  @Input() message = 'Loading...';
}
