import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
})
export class Settings {
  activeTab: 'general' | 'security' | 'notifications' | 'danger' = 'general';

  // General
  studioName = 'ColorIdea Studio';
  supportEmail = 'admin@coloridea.com';
  timezone = 'Africa/Cairo';
  language = 'en';
  saved = false;

  // Toggles
  autoArchive = true;
  clientNotifications = false;
  weeklyReports = true;
  maintenanceMode = false;

  // Security
  twoFactor = false;
  sessionTimeout = '30';

  // Notifications
  emailOnNewProject = true;
  emailOnPayment = true;
  emailOnDeliverable = false;
  browserPush = false;

  saveGeneral() {
    this.saved = true;
    setTimeout(() => (this.saved = false), 3000);
  }

  confirmDelete = '';
  showDeleteConfirm = false;

  tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'danger', label: 'Danger Zone', icon: '⚠️' },
  ];
}
