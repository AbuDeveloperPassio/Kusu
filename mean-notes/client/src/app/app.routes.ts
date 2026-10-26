import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'notes' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/register/register').then((m) => m.RegisterPage),
  },
  {
    path: 'notes',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/notes/notes').then((m) => m.NotesPage),
  },
  { path: '**', redirectTo: 'notes' },
];
