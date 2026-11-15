import { ErrorApp } from '../middlewares/errores';

/** Convierte el parámetro :id de la ruta en un número entero positivo o responde 400. */
export function enteroPositivo(valor: string, etiqueta: string): number {
  const numero = Number(valor);
  if (!/^\d+$/.test(valor) || !Number.isSafeInteger(numero) || numero <= 0) {
    throw new ErrorApp(400, `${etiqueta} no es válido.`, 'ID_INVALIDO');
  }
  return numero;
}

/** MySQL devuelve los DECIMAL como texto ("1500.00"); esto los pasa a número con dos decimales. */
export function dinero(valor: unknown): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? Math.round(numero * 100) / 100 : 0;
}

/** MySQL devuelve TINYINT(1) como 0 o 1; esto lo pasa a true o false. */
export function bandera(valor: unknown): boolean {
  return valor === true || valor === 1 || valor === '1';
}

/** Valor provisional para columnas únicas mientras se conoce el id definitivo. */
export function codigoTemporal(prefijo: string): string {
    return `${prefijo}${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}
