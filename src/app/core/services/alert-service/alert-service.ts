import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private getThemeConfig(): Partial<SweetAlertOptions> {
    const isDark = localStorage.getItem('theme') === 'dark';
    return {
      background: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.92)',
      color: isDark ? '#f8fafc' : '#1e293b',
    };
  }

  private fire(config: SweetAlertOptions): Promise<any> {
    // الـ theme بياخد الأولوية — لازم يجي آخر في الـ merge
    const theme = this.getThemeConfig();
    const finalConfig = Object.assign({}, config, theme) as SweetAlertOptions;

    return new Promise((resolve) => {
      this.zone.runOutsideAngular(() => {
        Swal.fire(finalConfig).then((result) => {
          this.zone.run(() => resolve(result));
        });
      });
    });
  }

  private get baseConfig(): SweetAlertOptions {
    return {
      customClass: {
        popup: 'coloridea-popup',
        confirmButton: 'coloridea-confirm-btn',
        cancelButton: 'coloridea-cancel-btn',
        title: 'coloridea-title',
        htmlContainer: 'coloridea-text',
        icon: 'coloridea-icon',
      },
      buttonsStyling: false,
    };
  }

  private injectStyles() {
    if (document.getElementById('coloridea-swal-styles')) return;

    const style = document.createElement('style');
    style.id = 'coloridea-swal-styles';
    style.innerHTML = `
      .coloridea-popup {
        border-radius: 2rem !important;
        border: 1px solid rgba(226, 232, 240, 0.8) !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15) !important;
        padding: 2rem !important;
        backdrop-filter: blur(20px) !important;
        max-width: 380px !important;
      }
      .coloridea-title {
        font-size: 1rem !important;
        font-weight: 900 !important;
        letter-spacing: -0.02em !important;
        margin-bottom: 0.25rem !important;
      }
      .coloridea-text {
        font-size: 0.8rem !important;
        font-weight: 600 !important;
        color: #64748b !important;
      }
      .coloridea-confirm-btn {
        background: #2563eb !important;
        color: white !important;
        font-weight: 900 !important;
        font-size: 0.65rem !important;
        letter-spacing: 0.15em !important;
        text-transform: uppercase !important;
        padding: 0.75rem 2rem !important;
        border-radius: 1rem !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        box-shadow: 0 4px 15px rgba(37, 99, 235, 0.3) !important;
      }
      .coloridea-confirm-btn:hover {
        background: #1d4ed8 !important;
        transform: scale(1.02) !important;
      }
      .coloridea-cancel-btn {
        background: #f1f5f9 !important;
        color: #64748b !important;
        font-weight: 900 !important;
        font-size: 0.65rem !important;
        letter-spacing: 0.15em !important;
        text-transform: uppercase !important;
        padding: 0.75rem 2rem !important;
        border-radius: 1rem !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        margin-right: 0.5rem !important;
      }
      .coloridea-cancel-btn:hover {
        background: #e2e8f0 !important;
      }
      .coloridea-icon {
        border: none !important;
        margin-bottom: 0.5rem !important;
      }
      .swal2-timer-progress-bar {
        background: #2563eb !important;
        border-radius: 1rem !important;
      }
    `;
    document.head.appendChild(style);
  }

  // ✅ Success
  success(message: string, title: string = 'Done!') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.baseConfig,
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'OK',
      timer: 2500,
      timerProgressBar: true,
    });
  }

  // ❌ Error
  error(message: string, title: string = 'Something went wrong') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.baseConfig,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Try Again',
      timer: 4000,
      timerProgressBar: true,
    });
  }

  // ⚠️ Warning
  warning(message: string, title: string = 'Warning') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.baseConfig,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'OK',
      timer: 4000,
      timerProgressBar: true,
    });
  }

  // ℹ️ Info
  info(message: string, title: string = 'Info') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.baseConfig,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'OK',
      timer: 4000,
      timerProgressBar: true,
    });
  }

  // 🗑️ Confirm (للحذف)
  confirm(message: string, title: string = 'Are you sure?') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.baseConfig,
      icon: 'warning',
      title,
      text: message,
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });
  }
}
