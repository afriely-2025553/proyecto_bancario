import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Api } from '../../core/api';
import { mensajeError } from '../../core/formato';
import { Cuenta } from '../../core/modelos';

type TipoOperacion = 'deposito' | 'retiro' | 'transferencia';

@Component({
  selector: 'app-operaciones',
  imports: [ReactiveFormsModule],
  templateUrl: './operaciones.html',
})
export class Operaciones {
  private readonly api = inject(Api);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly mensaje = signal('');
  readonly error = signal('');
  readonly formulario = inject(FormBuilder).nonNullable.group({
    tipo: ['deposito' as TipoOperacion],
    cuentaId: [0],
    destinoId: [0],
    monto: [''],
    descripcion: [''],
  });

  constructor() {
    this.api.cuentas({ estado: 'activa' }).subscribe((lista) => this.cuentas.set(lista));
  }

  enviar(): void {
    this.mensaje.set('');
    this.error.set('');
    this.peticion().subscribe({
      next: () => {
        this.mensaje.set('Operación registrada.');
        this.formulario.patchValue({ monto: '', descripcion: '' });
      },
      error: (error: unknown) => this.error.set(mensajeError(error)),
    });
  }

  private peticion(): Observable<unknown> {
    const v = this.formulario.getRawValue();
    const monto = Number(v.monto);
    if (v.tipo === 'transferencia') {
      return this.api.transferir(v.cuentaId, v.destinoId, monto, v.descripcion);
    }
    return v.tipo === 'deposito'
      ? this.api.depositar(v.cuentaId, monto, v.descripcion)
      : this.api.retirar(v.cuentaId, monto, v.descripcion);
  }
}
