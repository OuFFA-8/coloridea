import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'; // مهم جداً للفيديو

export interface ProjectFile {
  id: string; // رقم الملف للعرض (#01)
  title: string; // عنوان الملف
  date: string; // تاريخ الرفع
  type: 'image' | 'video'; // نوع الملف لتحديد طريقة العرض في المودال
  thumbnail: string; // رابط الصورة المصغرة للكارت
  url: string; // الرابط الأصلي (صورة كبيرة أو رابط فيديو Embed)
}

// 2. تعريف السكشن الرئيسي (الأكورديون)
export interface ProjectDeliverable {
  title: string; // عنوان المرحلة (Phase 1, Phase 2...)
  icon: string; // الأيقونة (Emoji)
  files: ProjectFile[]; // قائمة الملفات اللي جوا السكشن ده
}

@Component({
  selector: 'app-deliverables',
  imports: [],
  templateUrl: './deliverables.html',
  styleUrl: './deliverables.css',
})
export class Deliverables {
  selectedMedia: any = null;

  constructor(private sanitizer: DomSanitizer) {}

  // دالة لفتح المودال
  openMedia(file: any) {
    this.selectedMedia = file;
  }

  // دالة لغلق المودال
  closeModal() {
    this.selectedMedia = null;
  }

  // دالة عشان أنجولر يثق في لينك الفيديو
  getSafeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  projectDeliverables: ProjectDeliverable[] = [
    {
      title: 'Aerial Photography Sessions',
      icon: '🚁',
      files: [
        {
          id: 'A-01',
          title: 'Site Overview - North Angle',
          date: '01 Feb 2026',
          type: 'image',
          thumbnail:
            'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=500&q=80',
          url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=1920&q=80',
        },
        {
          id: 'A-02',
          title: 'Drone Flyover Video',
          date: '05 Feb 2026',
          type: 'video',
          thumbnail:
            'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=500&q=80',
          url: 'https://www.youtube.com/embed/LXb3EKWsInQ',
        },
      ],
    },
    {
      title: 'Ground Photography Sessions',
      icon: '📸',
      files: [
        {
          id: 'G-01',
          title: 'Foundation Inspection',
          date: '10 Feb 2026',
          type: 'image',
          thumbnail:
            'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=500&q=80',
          url: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1920&q=80',
        },
        {
          id: 'G-02',
          title: 'Interior Detail Shots',
          date: '12 Feb 2026',
          type: 'image',
          thumbnail:
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=500&q=80',
          url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80',
        },
      ],
    },
    {
      title: 'Timelapse Camera',
      icon: '⏱️',
      files: [
        {
          id: 'T-01',
          title: 'Construction Week 1-4',
          date: '28 Feb 2026',
          type: 'video',
          thumbnail:
            'https://images.unsplash.com/photo-1590959651373-a3db0f38a961?auto=format&fit=crop&w=500&q=80',
          url: 'https://www.youtube.com/embed/tgbNymZ7vqY',
        },
      ],
    },
    {
      title: 'Monthly Update Videos',
      icon: '📅',
      files: [
        {
          id: 'M-01',
          title: 'January Progress Report',
          date: '31 Jan 2026',
          type: 'video',
          thumbnail:
            'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=500&q=80',
          url: 'https://www.youtube.com/embed/EngW7tLk6R8',
        },
      ],
    },
    {
      title: 'Quarterly Edited Videos',
      icon: '🎬',
      files: [
        {
          id: 'Q-01',
          title: 'Q1 Highlights Reel',
          date: '31 Mar 2026',
          type: 'video',
          thumbnail:
            'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=500&q=80',
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        },
      ],
    },
    {
      title: 'Photo Sessions',
      icon: '🖼️',
      files: [
        {
          id: 'P-01',
          title: 'Team Safety Event',
          date: '15 Mar 2026',
          type: 'image',
          thumbnail:
            'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=500&q=80',
          url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',
        },
      ],
    },
  ];
}
