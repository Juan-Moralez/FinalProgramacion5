import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Favorite } from '../model/favorito.model';
import { AuthService } from '../services/auth.service';
import { FavoritesService } from '../services/favorite.service';

@Component({
  selector: 'app-favorite-form',
  standalone: true,
  imports: [NgIf, FormsModule, RouterLink],
  templateUrl: './favorite-form.component.html',
  styleUrl: './favorite-form.components.css'
})
export class FavoriteFormComponent implements OnInit {
  private authService = inject(AuthService);
  private favoritesService = inject(FavoritesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  mode: 'create' | 'edit' = 'create';
  loading = true;
  saving = false;
  errorMessage = '';

  uid = '';
  favoriteId = '';
  countryCode = '';
  countryName = '';
  comment = '';
  rating = 3;

  async ngOnInit(): Promise<void> {
    const user =
      this.authService.getCurrentUser() ??
      (await Promise.race([
        this.authService.getUserAfterAuthReady(),
        this.resolveNullAfter(2500)
      ]));

    if (!user) {
      this.errorMessage = 'Sesión inválida.';
      this.loading = false;
      this.cdr.detectChanges();
      return;
    }

    this.uid = user.uid;

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.mode = 'edit';
      this.favoriteId = id;
      await this.loadFavoriteForEdit(id);
      return;
    }

    this.mode = 'create';
    this.countryCode = (this.route.snapshot.queryParamMap.get('countryCode') ?? '').toUpperCase();
    this.countryName = this.route.snapshot.queryParamMap.get('countryName') ?? '';

    if (!this.countryCode || !this.countryName) {
      this.errorMessage = 'Debes seleccionar un país desde la lista principal.';
    }

    this.loading = false;
    this.cdr.detectChanges();
  }

  private async loadFavoriteForEdit(id: string): Promise<void> {
    try {
      const favorite = await Promise.race([
        this.favoritesService.getFavoriteById(this.uid, id),
        this.timeoutResult<Favorite | null>(6000)
      ]);

      if (!favorite) {
        this.errorMessage = 'No se encontró el favorito.';
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }

      this.setFormValues(favorite);
      this.loading = false;
      this.cdr.detectChanges();
    } catch {
      this.errorMessage = 'No se pudo cargar el favorito.';
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  private timeoutResult<T>(ms: number): Promise<T> {
    return new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('timeout')), ms);
    });
  }

  private resolveNullAfter(ms: number): Promise<null> {
    return new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), ms);
    });
  }

  private setFormValues(favorite: Favorite): void {
    this.countryCode = favorite.countryCode;
    this.countryName = favorite.countryName;
    this.comment = favorite.comment;
    this.rating = favorite.rating;
  }

  async onSubmit(): Promise<void> {
    this.errorMessage = '';

    if (!this.uid) {
      this.errorMessage = 'Sesión inválida.';
      return;
    }

    if (this.comment.trim().length < 3) {
      this.errorMessage = 'El comentario debe tener al menos 3 caracteres.';
      return;
    }

    if (!Number.isInteger(this.rating) || this.rating < 1 || this.rating > 5) {
      this.errorMessage = 'La puntuación debe estar entre 1 y 5.';
      return;
    }

    this.saving = true;

    try {
      if (this.mode === 'create') {
        if (!this.countryCode || !this.countryName) {
          this.errorMessage = 'Falta información del país.';
          this.saving = false;
          return;
        }

        await this.favoritesService.addFavorite(this.uid, {
          countryCode: this.countryCode,
          countryName: this.countryName,
          comment: this.comment,
          rating: this.rating
        });
      } else {
        await this.favoritesService.updateFavorite(this.uid, this.favoriteId, {
          comment: this.comment,
          rating: this.rating
        });
      }

      await this.router.navigate(['/favorites']);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'duplicate-country') {
        this.errorMessage = 'Ese país ya existe en tus favoritos.';
      } else {
        this.errorMessage = 'No se pudo guardar el favorito.';
      }
    } finally {
      this.saving = false;
      this.cdr.detectChanges();
    }
  }
}
