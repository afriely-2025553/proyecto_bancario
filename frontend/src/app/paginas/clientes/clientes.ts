import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { fecha, mensajeError } from '../../core/formato';
import { Cliente } from '../../core/modelos';

@Component({
  selector: 'app-clientes',
  imports: [RouterLink],
  templateUrl: './clientes.html',
})
export class Clientes {
  private readonly api = inject(Api);
  readonly clientes = signal<Cliente[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly fecha = fecha;
  private texto = '';
  private estado = '';

  constructor() {
    this.cargar();
  }

  buscar(texto: string, estado: string): void {
    this.texto = texto.trim();
    this.estado = estado;
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.clientes(this.texto, this.estado).subscribe({
      next: (lista) => {
        this.clientes.set(lista);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(mensajeError(error));
        this.cargando.set(false);
      },
    });
  }

  desactivar(cliente: Cliente): void {
    if (!confirm(`¿Desactivar a ${cliente.nombres} ${cliente.apellidos}?`)) {
      return;
    }
    this.api.desactivarCliente(cliente.id).subscribe({
      next: () => {
        this.mensaje.set('Cliente desactivado.');
        this.cargar();
      },
      error: (error: unknown) => this.mensaje.set(mensajeError(error)),
    });
  }
}
