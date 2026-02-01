import { Component } from '@angular/core';
import { MyTranslate } from '../../../core/services/my-translate/my-translate';
import { ThemeServices } from '../../../core/services/theme-services/theme-services';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  constructor(
    public themeService: ThemeServices,
    public myTrans: MyTranslate,
  ) {}
}
