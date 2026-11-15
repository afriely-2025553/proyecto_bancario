import { RowDataPacket } from 'mysql2';
import { consultar } from '../config/db';
import { dinero } from '../utils/utilidades';

const FILTRO_FECHA = 'AND (? IS NULL OR fecha >= ?) AND (? IS NULL OR fecha < DATE_ADD(?, INTERVAL 1 DAY))';

/** Cantidad y suma de montos de una tabla en el periodo indicado. */
export async function totales(tabla: string, condicion: string, desde: string | null, hasta: string | null) {
  const filas = await consultar<RowDataPacket>(
    `SELECT COUNT(*) AS cantidad, COALESCE(SUM(monto), 0) AS monto
     FROM ${tabla} WHERE ${condicion} ${FILTRO_FECHA}`,
    [desde, desde, hasta, hasta],
  );
  return { cantidad: Number(filas[0].cantidad), monto: dinero(filas[0].monto) };
}

export async function resumenCuentas() {
  const filas = await consultar<RowDataPacket>(
    `SELECT SUM(estado = 'activa') AS activas, SUM(estado = 'inactiva') AS inactivas,
            COALESCE(SUM(saldo), 0) AS saldo_total
     FROM cuenta`,
  );
  return {
    activas: Number(filas[0].activas || 0),
    inactivas: Number(filas[0].inactivas || 0),
    saldoTotal: dinero(filas[0].saldo_total),
  };
}

export async function resumenClientes() {
  const filas = await consultar<RowDataPacket>(
    'SELECT SUM(activo = 1) AS activos, SUM(activo = 0) AS inactivos FROM cliente',
  );
  return {
    activos: Number(filas[0].activos || 0),
    inactivos: Number(filas[0].inactivos || 0),
  };
}
