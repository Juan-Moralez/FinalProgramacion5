import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  

  email = '';
  password = '';

  loading = false;
  errorMessage = '';

  async onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Completá correo y contraseña.';
      return;
    }

    try {
      this.loading = true;
      await this.authService.login(this.email.trim(), this.password);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const countryCode = this.route.snapshot.queryParamMap.get('countryCode');
      const countryName = this.route.snapshot.queryParamMap.get('countryName');

      if (returnUrl === '/favorites/new' && countryCode && countryName) {
        await this.router.navigate(['/favorites/new'], {
          queryParams: { countryCode, countryName }
        });
      } else {
        await this.router.navigateByUrl(returnUrl || '/');
      }
    } catch (error: any) {
      this.errorMessage = this.mapFirebaseError(error?.code);
    } finally {
      this.loading = false;
    }
  }
  

  private mapFirebaseError(code?: string): string {
    switch (code) {
      case 'auth/invalid-email':
        return 'El correo no es válido.';
      case 'auth/invalid-credential':
        return 'Correo o contraseña incorrectos.';
      case 'auth/user-disabled':
        return 'Este usuario fue deshabilitado.';
      default:
        return 'No se pudo iniciar sesión.';
    }
  }
}
