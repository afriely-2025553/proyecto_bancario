import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Confirmacion } from '../../compartido/confirmacion/confirmacion';
import { Api } from '../../core/api';
import { fechaHora, mensajeError, moneda } from '../../core/formato';
import { Cuenta } from '../../core/modelos';

@Component({
  selector: 'app-cuentas',
  imports: [RouterLink, Confirmacion],
  templateUrl: './cuentas.html',
})
export class Cuentas {
  private readonly api = inject(Api);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly pendiente = signal<Cuenta | null>(null);
  readonly procesando = signal(false);
  readonly moneda = moneda;
  readonly fechaHora = fechaHora;
  private filtro = { q: '', estado: '' };

  constructor() {
    this.cargar();
  }

  buscar(q: string, estado: string): void {
    this.filtro = { q: q.trim(), estado };
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.cuentas(this.filtro).subscribe({
      next: (lista) => {
        this.cuentas.set(lista);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(mensajeError(error));
        this.cargando.set(false);
      },
    });
  }

  cambiarEstado(cuenta: Cuenta): void {
    this.mensaje.set('');
    this.pendiente.set(cuenta);
  }

  confirmarCambio(cuenta: Cuenta): void {
    const nuevo = cuenta.estado === 'activa' ? 'inactiva' : 'activa';
    this.procesando.set(true);
    this.api.cambiarEstadoCuenta(cuenta.id, nuevo).subscribe({
      next: (actualizada) => {
        this.mensaje.set(`La cuenta ${actualizada.numeroCuenta} quedó ${actualizada.estado}.`);
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
