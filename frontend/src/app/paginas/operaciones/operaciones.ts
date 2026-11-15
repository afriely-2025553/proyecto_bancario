import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { Api } from '../../core/api';
import { fechaHora, mensajeError, moneda } from '../../core/formato';
import { Cuenta } from '../../core/modelos';

type TipoOperacion = 'deposito' | 'retiro' | 'transferencia';
type Paso = 'datos' | 'confirmar' | 'listo';

const LIMITE = 1_000_000;

interface Comprobante {
  tipo: TipoOperacion;
  cuenta: string;
  destino: string | null;
  monto: number;
  saldoAnterior: number;
  saldoPosterior: number;
  fecha: string;
  referencia: string | null;
}

@Component({
  selector: 'app-operaciones',
  imports: [ReactiveFormsModule],
  templateUrl: './operaciones.html',
})
export class Operaciones {
  private readonly api = inject(Api);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly paso = signal<Paso>('datos');
  readonly intento = signal(false);
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly comprobante = signal<Comprobante | null>(null);
  readonly moneda = moneda;
  readonly fechaHora = fechaHora;
  readonly nombre: Record<TipoOperacion, string> = {
    deposito: 'Depósito',
    retiro: 'Retiro',
    transferencia: 'Transferencia',
  };

  readonly formulario = inject(FormBuilder).nonNullable.group({
    tipo: ['deposito' as TipoOperacion],
    cuentaId: [0],
    destinoId: [0],
    monto: [''],
    descripcion: [''],
  });

  /** Valores del formulario como señal, para usarlos en computed(). */
  private readonly valores = toSignal(
    this.formulario.valueChanges.pipe(map(() => this.formulario.getRawValue())),
    { initialValue: this.formulario.getRawValue() },
  );

  readonly origen = computed(() => this.cuentas().find((c) => c.id === this.valores().cuentaId) ?? null);
  readonly destino = computed(() => this.cuentas().find((c) => c.id === this.valores().destinoId) ?? null);
  readonly destinos = computed(() => this.cuentas().filter((c) => c.id !== this.valores().cuentaId));
  readonly esTransferencia = computed(() => this.valores().tipo === 'transferencia');

  readonly errorCuenta = computed(() => {
    const v = this.valores();
    if (!v.cuentaId) return 'Seleccione la cuenta.';
    if (v.tipo === 'transferencia' && !v.destinoId) return 'Seleccione la cuenta destino.';
    return '';
  });

  readonly errorMonto = computed(() => {
    const texto = this.valores().monto.trim();
    if (!texto) return 'Escriba el monto.';
    if (!/^\d+(\.\d{1,2})?$/.test(texto)) return 'Use solo números y como máximo dos decimales, por ejemplo 150.50.';
    const monto = Number(texto);
    if (monto <= 0) return 'El monto debe ser mayor que cero.';
    if (monto > LIMITE) return 'El monto supera el límite por operación de Q 1,000,000.00.';
    const cuenta = this.origen();
    if (cuenta && this.valores().tipo !== 'deposito' && monto > cuenta.saldo) {
      return `El monto supera el saldo disponible (${moneda(cuenta.saldo)}).`;
    }
    return '';
  });

  /** Saldo que quedará en la cuenta principal, calculado en centavos. */
  readonly saldoNuevo = computed(() => {
    const cuenta = this.origen();
    if (!cuenta || this.errorMonto()) return null;
    const saldo = Math.round(cuenta.saldo * 100);
    const monto = Math.round(Number(this.valores().monto) * 100);
    return (this.valores().tipo === 'deposito' ? saldo + monto : saldo - monto) / 100;
  });

  constructor() {
    this.cargarCuentas();
  }

  cargarCuentas(): void {
    this.api.cuentas({ estado: 'activa' }).subscribe((lista) => this.cuentas.set(lista.filter((c) => c.clienteActivo)));
  }

  continuar(): void {
    this.intento.set(true);
    this.error.set('');
    if (!this.errorCuenta() && !this.errorMonto()) {
      this.paso.set('confirmar');
    }
  }

  volver(): void {
    this.paso.set('datos');
  }

  confirmar(): void {
    this.enviando.set(true);
    this.peticion().subscribe({
      next: (comprobante) => {
        this.comprobante.set(comprobante);
        this.paso.set('listo');
        this.enviando.set(false);
        this.cargarCuentas();
      },
      error: (error: unknown) => {
        this.error.set(mensajeError(error));
        this.paso.set('datos');
        this.enviando.set(false);
      },
    });
  }

  nueva(): void {
    this.formulario.reset();
    this.intento.set(false);
    this.comprobante.set(null);
    this.paso.set('datos');
  }

  private peticion(): Observable<Comprobante> {
    const v = this.formulario.getRawValue();
    const monto = Number(v.monto);
    const descripcion = v.descripcion.trim();
    if (v.tipo === 'transferencia') {
      return this.api.transferir(v.cuentaId, v.destinoId, monto, descripcion).pipe(
        map((r) => ({
          tipo: v.tipo,
          cuenta: r.transferencia.cuentaOrigen,
          destino: r.transferencia.cuentaDestino,
          monto: r.transferencia.monto,
          saldoAnterior: r.movimientoOrigen.saldoAnterior,
          saldoPosterior: r.movimientoOrigen.saldoPosterior,
          fecha: r.movimientoOrigen.fecha,
          referencia: r.transferencia.referencia,
        })),
      );
    }
    const llamada = v.tipo === 'deposito'
      ? this.api.depositar(v.cuentaId, monto, descripcion)
      : this.api.retirar(v.cuentaId, monto, descripcion);
    return llamada.pipe(
      map(({ movimiento: m }) => ({
        tipo: v.tipo,
        cuenta: m.numeroCuenta,
        destino: null,
        monto: m.monto,
        saldoAnterior: m.saldoAnterior,
        saldoPosterior: m.saldoPosterior,
        fecha: m.fecha,
        referencia: m.referencia,
      })),
    );
  }
}
