import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { fecha, fechaHora, mensajeError, moneda } from '../../core/formato';
import { Cliente, Cuenta } from '../../core/modelos';

@Component({
  selector: 'app-cliente-detalle',
  imports: [RouterLink],
  templateUrl: './cliente-detalle.html',
})
export class ClienteDetalle {
  private readonly api = inject(Api);
  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  readonly cliente = signal<Cliente | null>(null);
  readonly cuentas = signal<Cuenta[]>([]);
  readonly error = signal('');
  readonly mensaje = signal('');
  readonly fecha = fecha;
  readonly fechaHora = fechaHora;
  readonly moneda = moneda;

  constructor() {
    this.api.cliente(this.id).subscribe({
      next: (cliente) => {
        this.cliente.set(cliente);
        this.api.cuentas({ clienteId: cliente.id }).subscribe((lista) => this.cuentas.set(lista));
      },
      error: (error: unknown) => this.error.set(mensajeError(error)),
    });
  }

  activar(): void {
    this.api.activarCliente(this.id).subscribe({
      next: (cliente) => {
        this.cliente.set(cliente);
        this.mensaje.set('Cliente activado.');
      },
      error: (error: unknown) => this.error.set(mensajeError(error)),
    });
  }
}
