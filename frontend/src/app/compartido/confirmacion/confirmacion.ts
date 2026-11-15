import { AfterViewInit, Component, ElementRef, input, output, viewChild } from '@angular/core';

/**
 * Diálogo de confirmación. El padre lo muestra con @if y lo quita al recibir
 * (confirmar) o (cancelar). Escape equivale a cancelar.
 */
@Component({
  selector: 'app-confirmacion',
  template: `
    <dialog #dialogo class="dialogo" aria-labelledby="titulo-confirmacion"
            (cancel)="$event.preventDefault(); cancelar.emit()">
      <h2 id="titulo-confirmacion">{{ titulo() }}</h2>
      <div class="dialogo-cuerpo"><ng-content /></div>
      <div class="acciones">
        <button type="button" class="boton" [class.peligro]="peligro()" [disabled]="ocupado()" (click)="confirmar.emit()">
          {{ ocupado() ? 'Procesando…' : textoConfirmar() }}
        </button>
        <button type="button" class="boton secundario" [disabled]="ocupado()" (click)="cancelar.emit()">Cancelar</button>
      </div>
    </dialog>
  `,
})
export class Confirmacion implements AfterViewInit {
  readonly titulo = input.required<string>();
  readonly textoConfirmar = input('Confirmar');
  readonly peligro = input(false);
  readonly ocupado = input(false);
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();

  private readonly dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  ngAfterViewInit(): void {
    this.dialogo().nativeElement.showModal();
  }
}
