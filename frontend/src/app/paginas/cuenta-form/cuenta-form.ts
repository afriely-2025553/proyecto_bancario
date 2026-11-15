import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { mensajeError } from '../../core/formato';
import { Cliente, TipoCuenta } from '../../core/modelos';

@Component({
  selector: 'app-cuenta-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cuenta-form.html',
})
export class CuentaForm {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  readonly clientes = signal<Cliente[]>([]);
  readonly tipos = signal<TipoCuenta[]>([]);
  readonly error = signal('');
  readonly guardando = signal(false);
  readonly formulario = inject(FormBuilder).nonNullable.group({
    clienteId: [Number(inject(ActivatedRoute).snapshot.queryParamMap.get('clienteId')) || 0, Validators.min(1)],
    tipoCuentaId: [0, Validators.min(1)],
  });

  constructor() {
    this.api.clientes('', 'activos').subscribe((lista) => this.clientes.set(lista));
    this.api.tiposCuenta().subscribe((lista) => this.tipos.set(lista.filter((tipo) => tipo.activo)));
  }

  invalido(campo: 'clienteId' | 'tipoCuentaId'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  guardar(): void {
    this.error.set('');
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { clienteId, tipoCuentaId } = this.formulario.getRawValue();
    this.guardando.set(true);
    this.api.crearCuenta(clienteId, tipoCuentaId).subscribe({
      next: () => void this.router.navigate(['/cuentas']),
      error: (error: unknown) => {
        this.guardando.set(false);
        this.error.set(mensajeError(error));
      },
    });
  }
}
