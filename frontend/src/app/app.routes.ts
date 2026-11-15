import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ClienteForm } from './paginas/cliente-form/cliente-form';
import { Clientes } from './paginas/clientes/clientes';
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
      { path: 'clientes', component: Clientes, title: 'Clientes' },
      { path: 'clientes/nuevo', component: ClienteForm, title: 'Registrar cliente' },
      { path: 'clientes/:id', component: ClienteForm, title: 'Editar cliente' },
      { path: 'clientes', component: Clientes, title: 'Clientes' },      { path: '**', redirectTo: 'inicio' },
    ],
  },
];
