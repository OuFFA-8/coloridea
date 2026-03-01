import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, NgZone, PLATFORM_ID } from '@angular/core';
import Swal, { SweetAlertOptions } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {
  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  private isBrowser = () => isPlatformBrowser(this.platformId);

  private getThemeConfig(): Partial<SweetAlertOptions> {
    const isDark = localStorage.getItem('theme') === 'dark';
    return {
      background: isDark ? '#1c1c1c' : '#ffffff',
      color: isDark ? '#f3f0ec' : '#444547',
    };
  }

  private fire(config: SweetAlertOptions): Promise<any> {
    return new Promise((resolve) => {
      this.zone.runOutsideAngular(() => {
        Swal.fire({ ...config, ...this.getThemeConfig() } as SweetAlertOptions).then((r) =>
          this.zone.run(() => resolve(r)),
        );
      });
    });
  }

  private get base(): SweetAlertOptions {
    return {
      customClass: {
        popup: 'ci-popup',
        confirmButton: 'ci-btn-confirm',
        cancelButton: 'ci-btn-cancel',
        title: 'ci-title',
        htmlContainer: 'ci-text',
        icon: 'ci-icon',
      },
      buttonsStyling: false,
    };
  }

  private injectStyles() {
    if (!this.isBrowser() || document.getElementById('ci-swal-styles')) return;
    const s = document.createElement('style');
    s.id = 'ci-swal-styles';
    s.innerHTML = `
      /* ===== Popup ===== */
      .ci-popup {
        border-radius: 1.75rem !important;
        border: 1px solid rgba(230,213,195,0.5) !important;
        box-shadow: 0 32px 64px -16px rgba(0,0,0,0.18) !important;
        padding: 2rem !important;
        backdrop-filter: blur(24px) !important;
        max-width: 380px !important;
        font-family: 'Alexandria', sans-serif !important;
      }

      /* ===== Title ===== */
      .ci-title {
        font-family: 'Alexandria', sans-serif !important;
        font-size: 1rem !important;
        font-weight: 900 !important;
        letter-spacing: -0.02em !important;
        margin-bottom: 0.25rem !important;
      }

      /* ===== Body text ===== */
      .ci-text {
        font-size: 0.8rem !important;
        font-weight: 600 !important;
        opacity: 0.6 !important;
      }

      /* ===== Icon — remove default border ===== */
      .ci-icon {
        border: none !important;
        margin-bottom: 0.5rem !important;
      }
      /* Recolor icons to brand */
      .swal2-success .swal2-success-ring { border-color: #68ab1f !important; }
      .swal2-success [class^=swal2-success-line] { background: #68ab1f !important; }
      .swal2-error { border-color: #f87171 !important; color: #f87171 !important; }
      .swal2-warning { border-color: #fa8728 !important; color: #fa8728 !important; }
      .swal2-info { border-color: #fa8728 !important; color: #fa8728 !important; }

      /* ===== Confirm button ===== */
      .ci-btn-confirm {
        background: #fa8728 !important;
        color: #fff !important;
        font-weight: 900 !important;
        font-size: 0.65rem !important;
        letter-spacing: 0.15em !important;
        text-transform: uppercase !important;
        padding: 0.75rem 2rem !important;
        border-radius: 1rem !important;
        border: none !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        box-shadow: 0 4px 16px rgba(250,135,40,0.3) !important;
      }
      .ci-btn-confirm:hover {
        background: #f97316 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 8px 24px rgba(250,135,40,0.35) !important;
      }

      /* ===== Cancel button ===== */
      .ci-btn-cancel {
        background: rgba(68,69,71,0.08) !important;
        color: #5c5f63 !important;
        font-weight: 900 !important;
        font-size: 0.65rem !important;
        letter-spacing: 0.15em !important;
        text-transform: uppercase !important;
        padding: 0.75rem 2rem !important;
        border-radius: 1rem !important;
        border: 1px solid rgba(230,213,195,0.6) !important;
        cursor: pointer !important;
        transition: all 0.2s !important;
        margin-inline-end: 0.5rem !important;
      }
      .ci-btn-cancel:hover {
        background: rgba(68,69,71,0.14) !important;
      }

      /* ===== Progress bar ===== */
      .swal2-timer-progress-bar {
        background: #fa8728 !important;
        border-radius: 1rem !important;
      }

      /* ===== Dark mode overrides ===== */
      .swal2-popup[style*="1c1c1c"] .ci-btn-cancel {
        background: rgba(255,255,255,0.06) !important;
        color: #aaa !important;
        border-color: rgba(68,69,71,0.3) !important;
      }
      .swal2-popup[style*="1c1c1c"] .ci-btn-cancel:hover {
        background: rgba(255,255,255,0.1) !important;
      }
    `;
    document.head.appendChild(s);
  }

  // ✅ Success
  success(message: string, title = 'Done!') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.base,
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'OK',
      timer: 2500,
      timerProgressBar: true,
    });
  }

  // ❌ Error
  error(message: string, title = 'Something went wrong') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.base,
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Try Again',
      timer: 4000,
      timerProgressBar: true,
    });
  }

  // ⚠️ Warning
  warning(message: string, title = 'Warning') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.base,
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'OK',
      timer: 4000,
      timerProgressBar: true,
    });
  }

  // ℹ️ Info
  info(message: string, title = 'Info') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.base,
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'OK',
      timer: 4000,
      timerProgressBar: true,
    });
  }

  // 🗑️ Confirm
  confirm(message: string, title = 'Are you sure?') {
    if (!this.isBrowser()) return Promise.resolve();
    this.injectStyles();
    return this.fire({
      ...this.base,
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
