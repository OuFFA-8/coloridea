import { Component } from '@angular/core';

interface FileAsset {
  name: string;
  image: string;
  driveLink: string;
}

interface Deliverable {
  title: string;
  icon: string;
  files: FileAsset[];
}

@Component({
  selector: 'app-deliverables',
  imports: [],
  templateUrl: './deliverables.html',
  styleUrl: './deliverables.css',
})
export class Deliverables {
  projectDeliverables = [
    {
      title: 'Aerial Photography Sessions',
      icon: '🚁',
      files: [
        {
          name: 'North View - High Res',
          image: 'https://picsum.photos/400/300?random=11',
          driveLink: '#',
        },
        {
          name: 'Horizon Panorama',
          image: 'https://picsum.photos/400/300?random=12',
          driveLink: '#',
        },
        {
          name: 'Top Down Detail',
          image: 'https://picsum.photos/400/300?random=13',
          driveLink: '#',
        },
        {
          name: 'Sunset Session',
          image: 'https://picsum.photos/400/300?random=14',
          driveLink: '#',
        },
      ],
    },
    {
      title: 'Ground Photography Sessions',
      icon: '📸',
      files: [
        {
          name: 'Main Entrance Exterior',
          image: 'https://picsum.photos/400/300?random=21',
          driveLink: '#',
        },
        {
          name: 'Landscape Detail',
          image: 'https://picsum.photos/400/300?random=22',
          driveLink: '#',
        },
      ],
    },
    {
      title: 'Timelapse Camera',
      icon: '⏳',
      files: [
        { name: 'Week 01 Recap', image: 'https://picsum.photos/400/300?random=31', driveLink: '#' },
        {
          name: 'Full Month Sequence',
          image: 'https://picsum.photos/400/300?random=32',
          driveLink: '#',
        },
      ],
    },
    {
      title: 'Monthly Update Videos',
      icon: '🎬',
      files: [
        {
          name: 'January Progress Film',
          image: 'https://picsum.photos/400/300?random=41',
          driveLink: '#',
        },
        {
          name: 'Site Walkthrough - Feb',
          image: 'https://picsum.photos/400/300?random=42',
          driveLink: '#',
        },
      ],
    },
    {
      title: 'Quarterly Edited Videos',
      icon: '🎞️',
      files: [
        {
          name: 'Q1 Master Montage',
          image: 'https://picsum.photos/400/300?random=51',
          driveLink: '#',
        },
      ],
    },
    {
      title: 'Photo Sessions',
      icon: '🖼️',
      files: [
        {
          name: 'Architectural Shots',
          image: 'https://picsum.photos/400/300?random=61',
          driveLink: '#',
        },
        {
          name: 'Interior Design Session',
          image: 'https://picsum.photos/400/300?random=62',
          driveLink: '#',
        },
        { name: 'Team on Site', image: 'https://picsum.photos/400/300?random=63', driveLink: '#' },
        {
          name: 'Architectural Shots',
          image: 'https://picsum.photos/400/300?random=61',
          driveLink: '#',
        },
        {
          name: 'Interior Design Session',
          image: 'https://picsum.photos/400/300?random=62',
          driveLink: '#',
        },
        { name: 'Team on Site', image: 'https://picsum.photos/400/300?random=63', driveLink: '#' },
      ],
    },
  ];
}
