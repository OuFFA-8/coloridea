import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from '../../../core/models/project';
import { ChartCard } from './../../../shared/components/chart-card/chart-card';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [ChartCard], // شلنا CommonModule لأننا هنستخدم @for و @if
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails {
  project!: Project;
  projectId!: number;

  // بيانات التشارتس الأصلية بتاعتك
  pieData = [40, 30, 30];
  lineData = [10, 25, 40, 60, 80];

  projectDeliverables = [
    {
      title: 'Aerial Photography Sessions',
      icon: '🚁',
      files: [
        { name: 'North View', image: 'https://picsum.photos/400/300?random=1', driveLink: '#' },
      ],
    },
    {
      title: 'Ground Photography Sessions',
      icon: '📸',
      files: [
        { name: 'Main Entrance', image: 'https://picsum.photos/400/300?random=2', driveLink: '#' },
      ],
    },
    {
      title: 'Timelapse Camera',
      icon: '⏳',
      files: [
        {
          name: 'Progress Week 1',
          image: 'https://picsum.photos/400/300?random=3',
          driveLink: '#',
        },
      ],
    },
    {
      title: 'Monthly Update Videos',
      icon: '🎬',
      files: [
        { name: 'January Recap', image: 'https://picsum.photos/400/300?random=4', driveLink: '#' },
      ],
    },
    {
      title: 'Quarterly Edited Videos',
      icon: '🎞️',
      files: [
        { name: 'Q1 Highlights', image: 'https://picsum.photos/400/300?random=5', driveLink: '#' },
      ],
    },
    {
      title: 'Photo Sessions',
      icon: '🖼️',
      files: [
        {
          name: 'Architectural Shot',
          image: 'https://picsum.photos/400/300?random=6',
          driveLink: '#',
        },
      ],
    },
  ];
}
