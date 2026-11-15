import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../core/api';
import { AuthService } from '../../core/auth.service';
import { mensajeError } from '../../core/formato';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  private readonly api = inject(Api);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly enviando = signal(false);
  readonly sesionExpirada = inject(ActivatedRoute).snapshot.queryParamMap.get('sesion') === 'expirada';
  readonly formulario = inject(FormBuilder).nonNullable.group({
    nombreUsuario: ['', Validators.required],
    contrasena: ['', Validators.required],
  });

  constructor() {
    if (this.auth.autenticado()) {
      void this.router.navigateByUrl('/inicio');
    }
  }

  invalido(campo: 'nombreUsuario' | 'contrasena'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  entrar(): void {
    this.error.set('');
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    const { nombreUsuario, contrasena } = this.formulario.getRawValue();
    this.enviando.set(true);
    this.api.login(nombreUsuario.trim(), contrasena).subscribe({
      next: (respuesta) => {
        this.auth.entrar(respuesta);
        void this.router.navigateByUrl('/inicio');
      },
      error: (error: unknown) => {
        this.enviando.set(false);
        this.formulario.controls.contrasena.reset('');
        this.error.set(mensajeError(error));
      },
    });
  }
}
