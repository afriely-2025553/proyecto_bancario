import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../core/api';
import { mensajeError } from '../../core/formato';
import { DatosCliente } from '../../core/modelos';

type Campo = 'identificacion' | 'nombres' | 'apellidos' | 'fechaNacimiento' | 'telefono' | 'correo' | 'direccion';

@Component({
  selector: 'app-cliente-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.html',
})
export class ClienteForm {
  private readonly api = inject(Api);
  private readonly router = inject(Router);

  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id')) || null;
  readonly error = signal('');
  readonly guardando = signal(false);
  readonly formulario = inject(FormBuilder).nonNullable.group({
    identificacion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(30), Validators.pattern(/^[A-Za-z0-9-]+$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    fechaNacimiento: [''],
    telefono: ['', Validators.maxLength(20)],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
    direccion: ['', Validators.maxLength(255)],
  });

  constructor() {
    if (this.id) {
      this.api.cliente(this.id).subscribe({
        next: (cliente) =>
          this.formulario.setValue({
            identificacion: cliente.identificacion,
            nombres: cliente.nombres,
            apellidos: cliente.apellidos,
            fechaNacimiento: cliente.fechaNacimiento ?? '',
            telefono: cliente.telefono ?? '',
            correo: cliente.correo,
            direccion: cliente.direccion ?? '',
          }),
        error: (error: unknown) => this.error.set(mensajeError(error)),
      });
    }
  }

  /** Mensaje del primer error del campo, solo después de que la persona lo tocó. */
  mensaje(campo: Campo): string {
    const control = this.formulario.controls[campo];
    if (!control.touched || !control.errors) {
      return '';
    }
    const errores = control.errors;
    if (errores['required']) return 'Este campo es obligatorio.';
    if (errores['email']) return 'Escriba un correo válido, por ejemplo nombre@correo.test.';
    if (errores['minlength']) return `Escriba al menos ${errores['minlength'].requiredLength} caracteres.`;
    if (errores['maxlength']) return `Admite como máximo ${errores['maxlength'].requiredLength} caracteres.`;
    if (errores['pattern']) return 'Use solo letras, números y guion.';
    return '';
  }

  guardar(): void {
    this.error.set('');
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const valores = this.formulario.getRawValue();
    const datos: DatosCliente = {
      ...valores,
      fechaNacimiento: valores.fechaNacimiento || null,
      telefono: valores.telefono || null,
      direccion: valores.direccion || null,
    };
    this.guardando.set(true);
    const peticion = this.id ? this.api.actualizarCliente(this.id, datos) : this.api.crearCliente(datos);
    peticion.subscribe({
      next: (cliente) => void this.router.navigate(['/clientes', cliente.id]),
      error: (error: unknown) => {
        this.guardando.set(false);
        this.error.set(mensajeError(error));
      },
    });
  }
}
