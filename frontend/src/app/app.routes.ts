import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { Inicio } from './paginas/inicio/inicio';
import { Login } from './paginas/login/login';
import { Shell } from './paginas/shell/shell';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión' },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      { path: 'inicio', component: Inicio, title: 'Inicio' },
      { path: '**', redirectTo: 'inicio' },
    ],
  },
];
