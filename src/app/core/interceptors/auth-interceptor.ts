import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  const token = localStorage.getItem('token');
  const lang = localStorage.getItem('lang') || 'en';

  const clonedReq = req.clone({
    setHeaders: {
      ...(token && { Authorization: `Bearer ${token}` }),
      'Accept-Language': lang,
    },
  });

  return next(clonedReq);
};
