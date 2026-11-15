import { Component, inject, signal } from '@angular/core';
import { Api } from '../../core/api';
import { fecha, mensajeError, moneda } from '../../core/formato';
import { Reporte as DatosReporte } from '../../core/modelos';

@Component({
  selector: 'app-reporte',
  templateUrl: './reporte.html',
})
export class Reporte {
  private readonly api = inject(Api);
  readonly reporte = signal<DatosReporte | null>(null);
  readonly error = signal('');
  readonly moneda = moneda;
  readonly fecha = fecha;

  constructor() {
    this.generar('', '');
  }

  generar(desde: string, hasta: string): void {
    this.error.set('');
    if (desde && hasta && desde > hasta) {
      this.error.set('La fecha inicial no puede ser mayor que la final.');
      return;
    }
    this.api.reporte(desde, hasta).subscribe({
      next: (reporte) => this.reporte.set(reporte),
      error: (error: unknown) => this.error.set(mensajeError(error)),
    });
  }
}
