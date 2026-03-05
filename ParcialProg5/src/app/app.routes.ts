import { Routes } from '@angular/router';
import { ListpaisesComponent } from './components/listpaises/listpaises.component';
import { LoginComponent } from './components/login.components';
import { RegisterComponent } from './components/register.component';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';
import { FavoritesListComponent } from './components/favorite-list.component';
import { FavoriteFormComponent } from './components/favorite-form.component';



export const routes: Routes = [
  { path: '', component: ListpaisesComponent },
  { path: 'login', component: LoginComponent, canActivate: [publicGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [publicGuard] },
  { path: 'favorites', component: FavoritesListComponent, canActivate: [authGuard] },
  { path: 'favorites/new', component: FavoriteFormComponent, canActivate: [authGuard] },
{ path: 'favorites/:id/edit', component: FavoriteFormComponent, canActivate: [authGuard] },
{ path: '**', redirectTo: '' },
];
