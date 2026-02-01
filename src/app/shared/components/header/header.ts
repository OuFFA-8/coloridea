import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // مهم جداً عشان الـ Pipes والـ Directives
import { TranslateModule } from '@ngx-translate/core'; // عشان الـ Pipe بتاع الترجمة يشتغل
import { MyTranslate } from '../../../core/services/my-translate/my-translate';
import { ThemeServices } from '../../../core/services/theme-services/theme-services';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true, // تأكد إنها موجودة لو بتستخدم الإصدارات الحديثة
  imports: [
    CommonModule, // عشان تقدر تستخدم الـ {{ }} والـ pipes براحتك
    TranslateModule,
    RouterLink,
    RouterLinkActive,
  ],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    public themeService: ThemeServices,
    public myTrans: MyTranslate,
  ) {}

  // دالة تبديل اللغة لو محتاج تناديها من الـ HTML
  toggleLanguage() {
    this.myTrans.changeLang(this.myTrans.currentLang === 'en' ? 'ar' : 'en');
  }
}
