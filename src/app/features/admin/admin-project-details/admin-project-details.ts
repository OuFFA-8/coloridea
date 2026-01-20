import { Component } from '@angular/core';
import { InfoCard } from '../../../shared/components/info-card/info-card';
import { StatusBadge } from '../../../shared/components/status-badge/status-badge';

@Component({
  selector: 'app-admin-project-details',
  imports: [StatusBadge, InfoCard],
  templateUrl: './admin-project-details.html',
  styleUrl: './admin-project-details.css',
})
export class AdminProjectDetails {
  project = {
    id: 1,
    name: 'Corporate Website',
    client: 'Acme Inc.',
    status: 'active' as const,
    budget: '$4,500',
    startDate: '2025-01-01',
    endDate: '2025-03-01',
    description: 'A full corporate website including landing pages and admin panel.',
  };

  team = [
    { name: 'Ahmed Ali', role: 'Frontend' },
    { name: 'Sara Mohamed', role: 'Backend' },
    { name: 'Omar Khaled', role: 'UI/UX' },
  ];
}
