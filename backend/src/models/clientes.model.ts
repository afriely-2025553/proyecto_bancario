import { RowDataPacket } from 'mysql2';
import { consultar, ejecutar } from '../config/db';
import { ErrorApp, traducirDuplicado } from '../middlewares/errores';
import { DatosCliente } from '../middlewares/validacion';
import { bandera, codigoTemporal } from '../utils/utilidades';

/** Fila tal como viene de MySQL (nombres con guion bajo). */
export interface FilaCliente extends RowDataPacket {
  id: number;
  codigo: string;
  identificacion: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string | null;
  telefono: string | null;
  correo: string;
  direccion: string | null;
  activo: number;
  fecha_registro: string;
}

/** Convierte la fila al formato que responde la API (camelCase y booleanos). */
export function aCliente(fila: FilaCliente) {
  return {
    id: fila.id,
    codigo: fila.codigo,
    identificacion: fila.identificacion,
    nombres: fila.nombres,
    apellidos: fila.apellidos,
    fechaNacimiento: fila.fecha_nacimiento,
    telefono: fila.telefono,
    correo: fila.correo,
    direccion: fila.direccion,
    activo: bandera(fila.activo),
    fechaRegistro: fila.fecha_registro,
  };
}

export const SQL_CLIENTE = `
  SELECT id, codigo, identificacion, nombres, apellidos, fecha_nacimiento,
         telefono, correo, direccion, activo, fecha_registro
  FROM cliente
`;

export async function listarClientes(q: string, activo: number | null) {
  const filas = await consultar<FilaCliente>(
    `${SQL_CLIENTE}
     WHERE (? = '' OR CONCAT(codigo, ' ', identificacion, ' ', nombres, ' ', apellidos, ' ', correo) LIKE ?)
       AND (? IS NULL OR activo = ?)
     ORDER BY id DESC`,
    [q, `%${q}%`, activo, activo],
  );
  return filas.map(aCliente);
}

export async function obtenerCliente(id: number) {
  const filas = await consultar<FilaCliente>(`${SQL_CLIENTE} WHERE id = ?`, [id]);
  if (!filas[0]) {
    throw new ErrorApp(404, 'El cliente no existe.', 'CLIENTE_NO_ENCONTRADO');
  }
  return aCliente(filas[0]);
}

/** Inserta un cliente nuevo o, si recibe idExistente, actualiza ese cliente. */
export async function guardarCliente(datos: DatosCliente, idExistente?: number) {
  const valores = [
    datos.identificacion,
    datos.nombres,
    datos.apellidos,
    datos.fechaNacimiento,
    datos.telefono,
    datos.correo,
    datos.direccion,
  ];
  try {
    if (idExistente) {
      await ejecutar(
        `UPDATE cliente SET identificacion = ?, nombres = ?, apellidos = ?, fecha_nacimiento = ?,
                telefono = ?, correo = ?, direccion = ?
         WHERE id = ?`,
        [...valores, idExistente],
      );
      return obtenerCliente(idExistente);
    }
    const resultado = await ejecutar(
      `INSERT INTO cliente (codigo, identificacion, nombres, apellidos, fecha_nacimiento, telefono, correo, direccion)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [codigoTemporal('TMP'), ...valores],
    );
    const codigo = `CLI-${String(resultado.insertId).padStart(4, '0')}`;
    await ejecutar('UPDATE cliente SET codigo = ? WHERE id = ?', [codigo, resultado.insertId]);
    return obtenerCliente(resultado.insertId);
  } catch (error) {
    traducirDuplicado(error);
  }
}

export async function actualizarActivoCliente(id: number, activo: boolean): Promise<void> {
  await ejecutar('UPDATE cliente SET activo = ? WHERE id = ?', [activo ? 1 : 0, id]);
}
