import { RowDataPacket } from 'mysql2';
import { consultar } from '../config/db';

export interface FilaUsuario extends RowDataPacket {
  id: number;
  nombre_usuario: string;
  contrasena_hash: string;
  nombre_completo: string;
  rol: 'administrador' | 'cajero';
  activo: number;
}

/** Devuelve el usuario con ese nombre, o undefined si no existe. */
export async function buscarUsuarioPorNombre(nombreUsuario: string) {
  const filas = await consultar<FilaUsuario>(
    `SELECT id, nombre_usuario, contrasena_hash, nombre_completo, rol, activo
     FROM usuario WHERE nombre_usuario = ?`,
    [nombreUsuario],
  );
  return filas[0];
}
