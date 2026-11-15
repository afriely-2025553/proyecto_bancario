import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Api } from '../../core/api';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export class Shell {
  readonly auth = inject(AuthService);
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  readonly enlaces = [
    { ruta: '/inicio', texto: 'Inicio' },
    { ruta: '/clientes', texto: 'Clientes' },
    { ruta: '/cuentas', texto: 'Cuentas' },
    { ruta: '/operaciones', texto: 'Operaciones' },
    { ruta: '/movimientos', texto: 'Movimientos' },
    { ruta: '/consultas', texto: 'Consultas' },
    { ruta: '/reporte', texto: 'Reporte' },
  ];

  salir(): void {
    // Aunque la API no responda, la sesión se cierra en el navegador.
    this.api.logout().subscribe({ next: () => this.cerrar(), error: () => this.cerrar() });
  }

  private cerrar(): void {
    this.auth.salir();
    void this.router.navigateByUrl('/login');
  }
}
