import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Api } from '../../core/api';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  host: { '(document:keydown.escape)': 'menuAbierto.set(false)' },
})
export class Shell {
  readonly auth = inject(AuthService);
  private readonly api = inject(Api);
  private readonly router = inject(Router);
  readonly menuAbierto = signal(false);

  readonly enlaces = [
    { ruta: '/inicio', texto: 'Inicio' },
    { ruta: '/clientes', texto: 'Clientes' },
    { ruta: '/cuentas', texto: 'Cuentas' },
    { ruta: '/operaciones', texto: 'Operaciones' },
    { ruta: '/movimientos', texto: 'Movimientos' },
    { ruta: '/consultas', texto: 'Consultas' },
    { ruta: '/reporte', texto: 'Reporte' },
  ];

  constructor() {
    // Al cambiar de página, el menú móvil se cierra solo.
    this.router.events
      .pipe(filter((evento) => evento instanceof NavigationEnd), takeUntilDestroyed())
      .subscribe(() => this.menuAbierto.set(false));
  }

  salir(): void {
    // Aunque la API no responda, la sesión se cierra en el navegador.
    this.api.logout().subscribe({ next: () => this.cerrar(), error: () => this.cerrar() });
  }

  private cerrar(): void {
    this.auth.salir();
    void this.router.navigateByUrl('/login');
  }
}
