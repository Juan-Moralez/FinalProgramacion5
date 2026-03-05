import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Favorite } from '../model/favorito.model';
import { AuthService } from '../services/auth.service';
import { FavoritesService } from '../services/favorite.service';

@Component({
  selector: 'app-favorites-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, AsyncPipe],
  templateUrl: './favorites-list.component.html',
  styleUrl: './favorites-list.component.css'
})
export class FavoritesListComponent implements OnInit {
  private authService = inject(AuthService);
  private favoritesService = inject(FavoritesService);

  favorites$: Observable<Favorite[]> = of([]);
  loading = true;
  errorMessage = '';
  currentUid = '';

  async ngOnInit(): Promise<void> {
    const user = this.authService.getCurrentUser();

    if (!user) {
      this.loading = false;
      this.errorMessage = 'No se pudo validar la sesión.';
      return;
    }

    this.currentUid = user.uid;
    this.favorites$ = this.favoritesService.getFavoritesByUser(user.uid);
    this.loading = false;
  }

  async deleteFavorite(favorite: Favorite): Promise<void> {
    if (!this.currentUid) {
      return;
    }

    const confirmed = window.confirm(`¿Eliminar "${favorite.countryName}" de favoritos?`);
    if (!confirmed) {
      return;
    }

    this.errorMessage = '';

    try {
      await this.favoritesService.deleteFavorite(this.currentUid, favorite.id);
    } catch {
      this.errorMessage = 'No se pudo eliminar el favorito.';
    }
  }
}
