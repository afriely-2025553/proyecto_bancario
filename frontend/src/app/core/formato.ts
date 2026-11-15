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
