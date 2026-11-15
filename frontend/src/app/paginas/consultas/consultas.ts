import { Component, inject, signal } from '@angular/core';
import { Api } from '../../core/api';
import { mensajeError, moneda } from '../../core/formato';
import { Consulta } from '../../core/modelos';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.html',
})
export class Consultas {
  private readonly api = inject(Api);
  readonly resultado = signal<Consulta | null>(null);
  readonly error = signal('');
  readonly moneda = moneda;

  buscar(texto: string): void {
    this.error.set('');
    this.api.consultar(texto.trim()).subscribe({
      next: (resultado) => this.resultado.set(resultado),
      error: (error: unknown) => this.error.set(mensajeError(error)),
    });
  }
}
