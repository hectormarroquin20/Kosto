import { UpperCasePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-language-selector',
  imports: [
    MatButtonModule,
    MatMenuModule,
    MatIconModule,
    UpperCasePipe,
  ],
  templateUrl: './language-selector.html',
  styleUrl: './language-selector.scss',
})
export class LanguageSelector {
  private translate = inject(TranslateService);
  public currentLanguage = 'es';

  ngOnInit() {
    const currentLang = this.translate.currentLang;
    const resolvedLang = typeof currentLang === 'function'
      ? currentLang()
      : currentLang;

    this.currentLanguage = resolvedLang || localStorage.getItem('lang') || 'es';
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('lang', lang);
  }
}
