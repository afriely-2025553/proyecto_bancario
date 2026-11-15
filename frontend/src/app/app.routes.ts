import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ClienteDetalle } from './paginas/cliente-detalle/cliente-detalle';
import { ClienteForm } from './paginas/cliente-form/cliente-form';
import { Consultas } from './paginas/consultas/consultas';
import { Clientes } from './paginas/clientes/clientes';
import { CuentaForm } from './paginas/cuenta-form/cuenta-form';
import { Cuentas } from './paginas/cuentas/cuentas';
import { Inicio } from './paginas/inicio/inicio';
import { Login } from './paginas/login/login';
import { Movimientos } from './paginas/movimientos/movimientos';
import { NoEncontrada } from './paginas/no-encontrada/no-encontrada';
import { Operaciones } from './paginas/operaciones/operaciones';
import { Reporte } from './paginas/reporte/reporte';
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
      { path: 'clientes/:id', component: ClienteDetalle, title: 'Ficha del cliente' },
      { path: 'clientes/:id/editar', component: ClienteForm, title: 'Editar cliente' },
      { path: 'cuentas', component: Cuentas, title: 'Cuentas' },
      { path: 'cuentas/nueva', component: CuentaForm, title: 'Abrir cuenta' },
      { path: 'operaciones', component: Operaciones, title: 'Operaciones' },
      { path: 'movimientos', component: Movimientos, title: 'Movimientos' },
      { path: 'consultas', component: Consultas, title: 'Consultas' },
      { path: 'reporte', component: Reporte, title: 'Reporte' },
      { path: 'clientes', component: Clientes, title: 'Clientes' },      
      { path: '**', component: NoEncontrada, title: 'Página no encontrada' },
    ],
  },
];
