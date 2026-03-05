import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

 const user = await authService.getUserAfterAuthReady();

  if (user) {
    return router.createUrlTree(['/']);
  }

  return true;
};
