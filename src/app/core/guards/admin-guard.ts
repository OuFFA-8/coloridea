import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServices } from '../services/auth-services/auth-services';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);
  const authServices = inject(AuthServices);

  if (!isPlatformBrowser(platformId)) return true;

  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  if (!authServices.isAdmin()) {
    router.navigate(['/client/dashboard']);
    return false;
  }

  return true;
};
