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
  readonly mensaje = signal('');
  readonly fecha = fecha;
  private texto = '';

  constructor() {
    this.cargar();
  }

  buscar(texto: string): void {
    this.texto = texto.trim();
    this.cargar();
  }

  cargar(): void {
    this.api.clientes(this.texto).subscribe((lista) => this.clientes.set(lista));
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
