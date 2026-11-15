import { Component, inject, signal } from '@angular/core';
import { Api } from '../../core/api';
import { fechaHora, mensajeError, moneda } from '../../core/formato';
import { Cuenta, Movimiento, NOMBRE_MOVIMIENTO } from '../../core/modelos';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.html',
})
export class Movimientos {
  private readonly api = inject(Api);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly movimientos = signal<Movimiento[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  readonly fechaHora = fechaHora;
  readonly moneda = moneda;
  readonly nombre = NOMBRE_MOVIMIENTO;
  private filtros = { cuentaId: 0, tipo: '', desde: '', hasta: '' };

  constructor() {
    this.api.cuentas().subscribe((lista) => this.cuentas.set(lista));
    this.cargar();
  }

  filtrar(cuentaId: string, tipo: string, desde: string, hasta: string): void {
    this.filtros = { cuentaId: Number(cuentaId), tipo, desde, hasta };
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.api.movimientos({ ...this.filtros, cuentaId: this.filtros.cuentaId || null }).subscribe({
      next: (lista) => {
        this.movimientos.set(lista);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        this.error.set(mensajeError(error));
        this.cargando.set(false);
      },
    });
  }

  /** Los depósitos y las transferencias recibidas suman; el resto resta. */
  suma(m: Movimiento): boolean {
    return m.tipo === 'deposito' || m.tipo === 'transferencia_entrada';
  }
}
