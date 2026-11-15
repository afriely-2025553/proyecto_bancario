import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Confirmacion } from '../../compartido/confirmacion/confirmacion';
import { Api } from '../../core/api';
import { fecha, mensajeError } from '../../core/formato';
import { Cliente } from '../../core/modelos';

@Component({
  selector: 'app-clientes',
  imports: [RouterLink, Confirmacion],
  templateUrl: './clientes.html',
})
export class Clientes {
  private readonly api = inject(Api);
  readonly clientes = signal<Cliente[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly pendiente = signal<Cliente | null>(null);
  readonly procesando = signal(false);
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
    this.mensaje.set('');
    this.pendiente.set(cliente);
  }

  confirmarDesactivar(cliente: Cliente): void {
    this.procesando.set(true);
    this.api.desactivarCliente(cliente.id).subscribe({
      next: () => {
        this.mensaje.set(`${cliente.nombres} ${cliente.apellidos} quedó inactivo.`);
        this.cerrarDialogo();
        this.cargar();
      },
      error: (error: unknown) => {
        this.mensaje.set(mensajeError(error));
        this.cerrarDialogo();
      },
    });
  }

  cerrarDialogo(): void {
    this.pendiente.set(null);
    this.procesando.set(false);
  }

}
