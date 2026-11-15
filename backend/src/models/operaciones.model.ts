import { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { enTransaccion } from '../config/db';
import { ErrorApp } from '../middlewares/errores';
import { aCentavos, bandera, dinero } from '../utils/utilidades';

type TipoMovimiento = 'deposito' | 'retiro' | 'transferencia_salida' | 'transferencia_entrada';

interface CuentaBloqueada extends RowDataPacket {
  id: number;
  numero_cuenta: string;
  saldo: string;
  estado: 'activa' | 'inactiva';
  cliente_activo: number;
}

/** Lee la cuenta y la bloquea hasta que termine la transacción. */
export async function bloquearCuenta(conexion: PoolConnection, id: number): Promise<CuentaBloqueada> {
  const [filas] = await conexion.query<CuentaBloqueada[]>(
    `SELECT c.id, c.numero_cuenta, c.saldo, c.estado, cl.activo AS cliente_activo
     FROM cuenta c
     INNER JOIN cliente cl ON cl.id = c.cliente_id
     WHERE c.id = ?
     FOR UPDATE`,
    [id],
  );
  if (!filas[0]) {
    throw new ErrorApp(404, 'La cuenta no existe.', 'CUENTA_NO_ENCONTRADA');
  }
  return filas[0];
}

/** Regla 9: una cuenta inactiva, o de un cliente desactivado, no opera. */
export function exigirOperable(cuenta: CuentaBloqueada): void {
  if (cuenta.estado !== 'activa') {
    throw new ErrorApp(400, `La cuenta ${cuenta.numero_cuenta} está inactiva y no puede operar.`, 'CUENTA_INACTIVA');
  }
  if (!bandera(cuenta.cliente_activo)) {
    throw new ErrorApp(400, 'El cliente está desactivado y sus cuentas no pueden operar.', 'CLIENTE_INACTIVO');
  }
}

/** Regla 8: cada operación queda registrada con fecha, tipo, monto y saldos. */
export async function insertarMovimiento(
  conexion: PoolConnection,
  datos: {
    cuentaId: number;
    transferenciaId: number | null;
    usuarioId: number;
    tipo: TipoMovimiento;
    monto: string;
    saldoAnterior: number;
    saldoPosterior: number;
    descripcion: string | null;
  },
): Promise<number> {
  const [resultado] = await conexion.query<ResultSetHeader>(
    `INSERT INTO movimiento (cuenta_id, transferencia_id, usuario_id, tipo, monto, saldo_anterior, saldo_posterior, descripcion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      datos.cuentaId,
      datos.transferenciaId,
      datos.usuarioId,
      datos.tipo,
      datos.monto,
      (datos.saldoAnterior / 100).toFixed(2),
      (datos.saldoPosterior / 100).toFixed(2),
      datos.descripcion,
    ],
  );
  return resultado.insertId;
}

export async function leerMovimiento(conexion: PoolConnection, id: number) {
  const [filas] = await conexion.query<RowDataPacket[]>(
    `SELECT m.id, m.cuenta_id, c.numero_cuenta, m.tipo, m.monto, m.saldo_anterior, m.saldo_posterior,
            m.descripcion, m.fecha
     FROM movimiento m
     INNER JOIN cuenta c ON c.id = m.cuenta_id
     WHERE m.id = ?`,
    [id],
  );
  const fila = filas[0];
  return {
    id: fila.id,
    cuentaId: fila.cuenta_id,
    numeroCuenta: fila.numero_cuenta,
    tipo: fila.tipo as TipoMovimiento,
    monto: dinero(fila.monto),
    saldoAnterior: dinero(fila.saldo_anterior),
    saldoPosterior: dinero(fila.saldo_posterior),
    descripcion: fila.descripcion,
    fecha: fila.fecha,
  };
}

/** Depósito o retiro: bloquea, valida, actualiza el saldo y registra el movimiento en una transacción. */
export async function operarCuenta(
  cuentaId: number,
  monto: string,
  tipo: 'deposito' | 'retiro',
  descripcion: string | null,
  usuarioId: number,
) {
  return enTransaccion(async (conexion) => {
    const cuenta = await bloquearCuenta(conexion, cuentaId);
    exigirOperable(cuenta);
    const anterior = aCentavos(cuenta.saldo);
    const cambio = aCentavos(monto);
    const posterior = tipo === 'deposito' ? anterior + cambio : anterior - cambio;
    if (posterior < 0) {
      throw new ErrorApp(400, 'El retiro supera el saldo disponible.', 'SALDO_INSUFICIENTE');
    }
    await conexion.query('UPDATE cuenta SET saldo = ? WHERE id = ?', [(posterior / 100).toFixed(2), cuenta.id]);
    const movimientoId = await insertarMovimiento(conexion, {
      cuentaId: cuenta.id,
      transferenciaId: null,
      usuarioId,
      tipo,
      monto,
      saldoAnterior: anterior,
      saldoPosterior: posterior,
      descripcion,
    });
    return leerMovimiento(conexion, movimientoId);
  });
}
