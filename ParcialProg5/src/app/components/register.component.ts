import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private strongPasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  email = '';
  password = '';
  confirmPassword = '';

  loading = false;
  errorMessage = '';
  successMessage = '';

  async onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Completá todos los campos.';
      return;
    }

    if (!this.isStrongPassword(this.password)) {
      this.errorMessage = 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    try {
      this.loading = true;
      await this.authService.register(this.email.trim(), this.password);
      this.successMessage = 'Usuario registrado correctamente. Redirigiendo...';
      setTimeout(() => this.router.navigate(['/login']), 900);
    } catch (error: any) {
      this.errorMessage = this.mapFirebaseError(error?.code);
    } finally {
      this.loading = false;
    }
  }

  private mapFirebaseError(code?: string): string {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'Ese correo ya está registrado.';
      case 'auth/invalid-email':
        return 'El correo no es válido.';
      case 'auth/weak-password':
        return 'La contraseña es demasiado débil.';
      default:
        return 'No se pudo registrar el usuario.';
    }
  }

  private isStrongPassword(password: string): boolean {
    return this.strongPasswordPattern.test(password);
  }
}
