import { RowDataPacket } from 'mysql2';
import { consultar, ejecutar } from '../config/db';
import { ErrorApp } from '../middlewares/errores';
import { bandera, codigoTemporal, dinero } from '../utils/utilidades';

export interface FilaCuenta extends RowDataPacket {
  id: number;
  numero_cuenta: string;
  cliente_id: number;
  cliente_codigo: string;
  cliente_nombre: string;
  cliente_activo: number;
  tipo_cuenta_id: number;
  tipo_cuenta: string;
  saldo: string;
  estado: 'activa' | 'inactiva';
  fecha_apertura: string;
}

export const SQL_CUENTA = `
  SELECT c.id, c.numero_cuenta, c.cliente_id, cl.codigo AS cliente_codigo,
         CONCAT(cl.nombres, ' ', cl.apellidos) AS cliente_nombre, cl.activo AS cliente_activo,
         c.tipo_cuenta_id, tc.nombre AS tipo_cuenta, c.saldo, c.estado, c.fecha_apertura
  FROM cuenta c
  INNER JOIN cliente cl ON cl.id = c.cliente_id
  INNER JOIN tipo_cuenta tc ON tc.id = c.tipo_cuenta_id
`;

export function aCuenta(fila: FilaCuenta) {
  return {
    id: fila.id,
    numeroCuenta: fila.numero_cuenta,
    clienteId: fila.cliente_id,
    clienteCodigo: fila.cliente_codigo,
    clienteNombre: fila.cliente_nombre,
    clienteActivo: bandera(fila.cliente_activo),
    tipoCuentaId: fila.tipo_cuenta_id,
    tipoCuenta: fila.tipo_cuenta,
    saldo: dinero(fila.saldo),
    estado: fila.estado,
    fechaApertura: fila.fecha_apertura,
  };
}

export async function listarCuentas(filtro: { clienteId: number | null; estado: string | null; q: string }) {
  const filas = await consultar<FilaCuenta>(
    `${SQL_CUENTA}
     WHERE (? IS NULL OR c.cliente_id = ?)
       AND (? IS NULL OR c.estado = ?)
       AND (? = '' OR CONCAT(c.numero_cuenta, ' ', cl.codigo, ' ', cl.nombres, ' ', cl.apellidos, ' ', cl.identificacion) LIKE ?)
     ORDER BY c.id DESC`,
    [filtro.clienteId, filtro.clienteId, filtro.estado, filtro.estado, filtro.q, `%${filtro.q}%`],
  );
  return filas.map(aCuenta);
}

export async function obtenerCuenta(id: number) {
  const filas = await consultar<FilaCuenta>(`${SQL_CUENTA} WHERE c.id = ?`, [id]);
  if (!filas[0]) {
    throw new ErrorApp(404, 'La cuenta no existe.', 'CUENTA_NO_ENCONTRADA');
  }
  return aCuenta(filas[0]);
}

/** Devuelve la fila del cliente con su columna activo, o undefined si no existe. */
export async function leerEstadoCliente(clienteId: number) {
  const filas = await consultar<RowDataPacket>('SELECT activo FROM cliente WHERE id = ?', [clienteId]);
  return filas[0];
}

/** Devuelve la fila del tipo de cuenta con su columna activo, o undefined si no existe. */
export async function leerTipoCuenta(tipoCuentaId: number) {
  const filas = await consultar<RowDataPacket>('SELECT activo FROM tipo_cuenta WHERE id = ?', [tipoCuentaId]);
  return filas[0];
}

/** Abre la cuenta con saldo 0 y estado activa; devuelve el id nuevo. */
export async function insertarCuenta(clienteId: number, tipoCuentaId: number): Promise<number> {
  const resultado = await ejecutar(
    `INSERT INTO cuenta (numero_cuenta, cliente_id, tipo_cuenta_id, saldo, estado)
     VALUES (?, ?, ?, 0.00, 'activa')`,
    [codigoTemporal('TMP'), clienteId, tipoCuentaId],
  );
  const numero = `100-${String(resultado.insertId).padStart(8, '0')}`;
  await ejecutar('UPDATE cuenta SET numero_cuenta = ? WHERE id = ?', [numero, resultado.insertId]);
  return resultado.insertId;
}

export async function listarTiposCuenta() {
  const filas = await consultar<RowDataPacket>('SELECT id, nombre, descripcion, activo FROM tipo_cuenta ORDER BY id');
  return filas.map((f) => ({ id: f.id, nombre: f.nombre, descripcion: f.descripcion, activo: bandera(f.activo) }));
}
