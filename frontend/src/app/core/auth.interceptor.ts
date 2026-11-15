import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  const peticion = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(peticion).pipe(
    catchError((error: unknown) => {
      const esLogin = req.url.endsWith('/auth/login');
      if (error instanceof HttpErrorResponse && error.status === 401 && !esLogin && auth.autenticado()) {
        auth.salir();
        void router.navigate(['/login'], { queryParams: { sesion: 'expirada' } });
      }
      return throwError(() => error);
    }),
  );
};
