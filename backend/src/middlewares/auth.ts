import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { configuracion } from '../config/config';
import { ErrorApp } from './errores';

export interface UsuarioToken {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  rol: 'administrador' | 'cajero';
}

declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

/** Middleware deja pasar solo peticiones con un token válido. */
export function exigirAuth(req: Request, _res: Response, next: NextFunction): void {
  const encabezado = req.header('authorization') || '';
  const token = encabezado.startsWith('Bearer ') ? encabezado.slice(7).trim() : '';
  if (!token) {
    throw new ErrorApp(401, 'Debe iniciar sesión.', 'NO_AUTENTICADO');
  }
  try {
    const datos = jwt.verify(token, configuracion().jwtSecreto) as UsuarioToken;
    req.usuario = {
      id: datos.id,
      nombreUsuario: datos.nombreUsuario,
      nombreCompleto: datos.nombreCompleto,
      rol: datos.rol,
    };
  } catch {
    throw new ErrorApp(401, 'La sesión expiró o no es válida. Inicie sesión de nuevo.', 'SESION_INVALIDA');
  }
  next();
}
