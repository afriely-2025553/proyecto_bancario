import { HttpErrorResponse } from '@angular/common/http';

/** Devuelve el mensaje de la API o uno genérico si no se pudo llegar al servidor. */
export function mensajeError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const cuerpo = error.error as { mensaje?: string } | null;
    if (cuerpo && typeof cuerpo.mensaje === 'string') {
      return cuerpo.mensaje;
    }
    if (error.status === 0 || error.status >= 502) {
      return 'No se pudo conectar con el servidor. Verifique que la API esté en ejecución.';
    }
  }
  return 'No se pudo completar la operación. Intente de nuevo.';
}

const NUMERO = new Intl.NumberFormat('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 1500.5 -> "Q 1,500.50" */
export function moneda(valor: number): string {
  return `Q ${NUMERO.format(valor)}`;
}

/** Fecha sin hora, como la de nacimiento ("1990-04-12"). */
export function fecha(valor: string | null): string {
  if (!valor) {
    return '—';
  }
  const [anio, mes, dia] = valor.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}
/** Fecha y hora de un registro ("2026-11-03 10:00:00"). */
export function fechaHora(valor: string): string {
  const [dia, hora = ''] = valor.split(' ');
  return `${fecha(dia)} ${hora.slice(0, 5)}`;
}

