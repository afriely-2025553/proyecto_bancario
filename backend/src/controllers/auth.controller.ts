import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { configuracion } from '../config/config';
import { UsuarioToken } from '../middlewares/auth';
import { ErrorApp } from '../middlewares/errores';
import { esquemaLogin, leerCuerpo } from '../middlewares/validacion';
import { buscarUsuarioPorNombre } from '../models/usuarios.model';
import { bandera } from '../utils/utilidades';

function firmar(usuario: UsuarioToken): string {
  const { jwtSecreto, jwtExpira } = configuracion();
  return jwt.sign(usuario, jwtSecreto, { expiresIn: jwtExpira as jwt.SignOptions['expiresIn'] });
}

export async function login(req: Request, res: Response) {
  const datos = leerCuerpo(esquemaLogin, req.body);
  const usuario = await buscarUsuarioPorNombre(datos.nombreUsuario);
  const coincide = usuario && bandera(usuario.activo)
    ? await bcrypt.compare(datos.contrasena, usuario.contrasena_hash)
    : false;
  if (!usuario || !coincide) {
    throw new ErrorApp(401, 'Usuario o contraseña incorrectos.', 'CREDENCIALES_INVALIDAS');
  }
  const publico: UsuarioToken = {
    id: usuario.id,
    nombreUsuario: usuario.nombre_usuario,
    nombreCompleto: usuario.nombre_completo,
    rol: usuario.rol,
  };
  res.json({ token: firmar(publico), usuario: publico });
}

export function yo(req: Request, res: Response) {
  res.json({ usuario: req.usuario });
}

export function logout(_req: Request, res: Response) {
  res.json({ mensaje: 'Sesión cerrada.' });
}
