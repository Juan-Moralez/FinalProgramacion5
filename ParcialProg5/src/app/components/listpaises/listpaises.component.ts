import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FavoritesService } from '../../services/favorite.service';
import { PaisesService } from '../../services/paises.service';

@Component({
  selector: 'app-listpaises',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  templateUrl: './listpaises.html',
  styleUrl: './listpaises.css'
})
export class ListpaisesComponent implements OnInit, OnDestroy {
  countries: any[] = [];
  errorMessage = '';
  loading = true;
  isAuthenticated = false;
  favoriteCountryCodes = new Set<string>();

  filterName = '';
  filterRegion = '';

  private authSubscription?: Subscription;
  private favoritesSubscription?: Subscription;

  constructor(
    private paisesService: PaisesService,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.observeAuthAndFavorites();
    this.loadCountries();
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
    this.favoritesSubscription?.unsubscribe();
  }

  private observeAuthAndFavorites(): void {
    this.authSubscription = this.authService.user$.subscribe((user) => {
      this.isAuthenticated = !!user;
      this.favoriteCountryCodes.clear();
      this.favoritesSubscription?.unsubscribe();

      if (!user) {
        this.cdr.detectChanges();
        return;
      }

      this.favoritesSubscription = this.favoritesService.getFavoritesByUser(user.uid).subscribe((favorites) => {
        this.favoriteCountryCodes = new Set(
          favorites
            .map((favorite) => (favorite.countryCode ?? '').toUpperCase().trim())
            .filter((code) => code.length > 0)
        );
        this.cdr.detectChanges();
      });
    });
  }

  loadCountries(): void {
    this.loading = true;
    this.errorMessage = '';

    let apiCall: Observable<any[]>;

    if (this.filterName.trim() !== '') {
      apiCall = this.paisesService.getPaisesByName(this.filterName.trim());
    } else if (this.filterRegion !== '') {
      apiCall = this.paisesService.getPaisesByRegion(this.filterRegion);
    } else {
      apiCall = this.paisesService.getAllpaises();
    }

    apiCall.subscribe({
      next: (data: any[]) => {
        this.countries = data;
        this.loading = false;

        if (data.length === 0) {
          this.errorMessage = 'No se encontraron países que coincidan con los filtros aplicados.';
        }

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        if (error.status === 404 && this.filterName.trim() !== '') {
          this.errorMessage = `No se encontró ningún país con el nombre "${this.filterName}".`;
        } else {
          this.errorMessage = 'No se pudieron cargar los países. Por favor, inténtalo de nuevo más tarde.';
        }

        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilter(): void {
    this.loadCountries();
  }

  isCountryAlreadyFavorite(country: any): boolean {
    const countryCode = (country?.cca3 ?? '').toUpperCase().trim();
    return !!countryCode && this.favoriteCountryCodes.has(countryCode);
  }

  goToAddFavorite(country: any): void {
    const user = this.authService.getCurrentUser();
    const countryCode = (country?.cca3 ?? '').toUpperCase().trim();
    const countryName = country?.name?.common ?? '';

    this.errorMessage = '';

    if (!countryCode || !countryName) {
      this.errorMessage = 'No se pudo obtener información del país.';
      return;
    }

    if (this.isCountryAlreadyFavorite(country)) {
      this.errorMessage = 'Ese país ya existe en tus favoritos.';
      return;
    }

    if (!user) {
      this.router.navigate(['/login'], {
        queryParams: {
          returnUrl: '/favorites/new',
          countryCode,
          countryName
        }
      });
      return;
    }

    this.router.navigate(['/favorites/new'], {
      queryParams: {
        countryCode,
        countryName
      }
    });
  }
}
