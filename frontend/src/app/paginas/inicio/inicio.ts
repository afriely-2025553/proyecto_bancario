import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { fechaHora, mensajeError, moneda } from '../../core/formato';
import { NOMBRE_MOVIMIENTO, Reporte } from '../../core/modelos';

@Component({
  selector: 'app-inicio',
  imports: [RouterLink],
  templateUrl: './inicio.html',
})
export class Inicio {
  readonly auth = inject(AuthService);
  readonly reporte = signal<Reporte | null>(null);
  readonly error = signal('');
  readonly moneda = moneda;
  readonly fechaHora = fechaHora;
  readonly nombreMovimiento = NOMBRE_MOVIMIENTO;

  constructor() {
    inject(Api).reporte().subscribe({
      next: (reporte) => this.reporte.set(reporte),
      error: (error: unknown) => this.error.set(mensajeError(error)),
    });
  }
}
