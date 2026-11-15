import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-no-encontrada',
  imports: [RouterLink],
  template: `
    <section class="panel">
      <div class="vacio">
        <h1>Página no encontrada</h1>
        <p>La dirección <code>{{ url }}</code> no existe en el sistema.</p>
        <a class="boton" routerLink="/inicio">Ir al inicio</a>
      </div>
    </section>
  `,
})
export class NoEncontrada {
  readonly url = inject(Router).url;
}
