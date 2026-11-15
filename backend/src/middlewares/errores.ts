import { NextFunction, Request, Response } from 'express';

/** Error esperado: lleva el estado HTTP, un mensaje para el usuario y un código para el programa. */
export class ErrorApp extends Error {
  constructor(
    public estado: number,
    mensaje: string,
    public codigo: string,
  ) {
    super(mensaje);
    this.name = 'ErrorApp';
  }
}

/** Convierte un error de clave única de MySQL en un mensaje entendible. */
export function traducirDuplicado(error: unknown): never {
  const e = error as { code?: string; message?: string };
  if (e.code === 'ER_DUP_ENTRY') {
    const texto = e.message || '';
    if (texto.includes('identificacion')) {
      throw new ErrorApp(409, 'La identificación ya está registrada.', 'IDENTIFICACION_DUPLICADA');
    }
    if (texto.includes('correo')) {
      throw new ErrorApp(409, 'El correo ya está registrado.', 'CORREO_DUPLICADO');
    }
    throw new ErrorApp(409, 'El registro choca con uno existente.', 'DUPLICADO');
  }
  throw error;
}

/** Responde 404 cuando ninguna ruta coincidió con la petición. */
export function rutaNoEncontrada(_req: Request, res: Response): void {
  res.status(404).json({ mensaje: 'El recurso no existe.', codigo: 'NO_ENCONTRADO' });
}

/** Último middleware de Express: toda respuesta de error sale de aquí. */
export function manejadorErrores(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof ErrorApp) {
    res.status(error.estado).json({ mensaje: error.message, codigo: error.codigo });
    return;
  }
  if ((error as { type?: string }).type === 'entity.parse.failed') {
    res.status(400).json({ mensaje: 'El cuerpo de la petición no es un JSON válido.', codigo: 'JSON_INVALIDO' });
    return;
  }
  console.error(error);
  res.status(500).json({ mensaje: 'Ocurrió un error interno. La operación no se completó.', codigo: 'ERROR_INTERNO' });
}
